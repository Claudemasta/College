import Providers from "./providers";

export const metadata = { title: "Inbox Briefing" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#14161C", color: "#EDEAE3", minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
