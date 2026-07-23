"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadEmails() {
    const res = await fetch("/api/emails");
    const data = await res.json();
    setEmails(data.emails || []);
  }

  useEffect(() => {
    if (session) loadEmails();
  }, [session]);

  async function runSync() {
    setSyncing(true);
    setMsg("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setMsg(`Synced — ${data.processed} new email(s) processed.`);
      await loadEmails();
    } catch (err) {
      setMsg("Error: " + err.message);
    } finally {
      setSyncing(false);
    }
  }

  if (status === "loading") return <p style={{ padding: 24 }}>Loading...</p>;

  if (!session) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia, serif" }}>Inbox Briefing</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>Sign in with your Outlook account to get started.</p>
        <button
          onClick={() => signIn("azure-ad")}
          style={{ padding: "10px 22px", fontSize: 15, background: "#F2A93C", color: "#14161C", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          Sign in with Microsoft
        </button>
      </div>
    );
  }

  const important = emails.filter((e) => e.status === "important");
  const skipped = emails.filter((e) => e.status === "skip");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontFamily: "Georgia, serif" }}>Inbox Briefing</h1>
        <button onClick={() => signOut()} style={{ fontSize: 12, background: "none", border: "1px solid #333748", color: "#EDEAE3", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>
          Sign out
        </button>
      </div>

      <button
        onClick={runSync}
        disabled={syncing}
        style={{ padding: "8px 18px", marginBottom: 10, background: "#F2A93C", color: "#14161C", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
      >
        {syncing ? "Syncing..." : "Sync now"}
      </button>
      {msg && <p style={{ fontSize: 13, opacity: 0.8 }}>{msg}</p>}
      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
        This also runs automatically every 15 minutes once deployed.
      </p>

      <h2 style={{ fontSize: 15, marginTop: 28, color: "#F2A93C" }}>Needs you ({important.length})</h2>
      {important.length === 0 && <p style={{ fontSize: 13, opacity: 0.5 }}>Nothing important yet.</p>}
      {important.map((e) => (
        <EmailRow key={e.id} email={e} accentColor="#F2A93C" />
      ))}

      <h2 style={{ fontSize: 15, marginTop: 28, opacity: 0.6 }}>Filtered out ({skipped.length})</h2>
      {skipped.length === 0 && <p style={{ fontSize: 13, opacity: 0.5 }}>Nothing filtered yet.</p>}
      {skipped.map((e) => (
        <EmailRow key={e.id} email={e} accentColor="#5B6172" muted />
      ))}
    </div>
  );
}

function EmailRow({ email, accentColor, muted }) {
  return (
    <div
      style={{
        background: "#1D202B",
        border: "1px solid #2A2E3B",
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
        opacity: muted ? 0.7 : 1,
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color: accentColor, marginBottom: 4 }}>
        {email.category}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{email.subject}</div>
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>{email.from}</div>
      <div style={{ fontSize: 13, opacity: 0.85 }}>{email.reason}</div>
    </div>
  );
}
