import AzureADProvider from "next-auth/providers/azure-ad";
import { redis } from "./redis";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read Mail.Read",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, Microsoft gives us a refresh token.
      // We save it to Redis so the automatic background sync job
      // can keep working even when nobody is signed in in a browser.
      if (account) {
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          try {
            await redis.set("outlook_refresh_token", account.refresh_token);
          } catch (e) {
            console.error("Failed to store refresh token", e);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
