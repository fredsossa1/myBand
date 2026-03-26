"use client";

import { useState, useEffect, useCallback } from "react";
import { getRoleDisplayName } from "@/lib/constants";
import type { Role } from "@/lib/types";

interface MemberRow {
  id: string;
  name: string;
  role: string;
  linked: boolean;
}

const ROLE_ORDER = ["lead", "bv", "bassist", "pianist", "drummer", "violinist"];

export function MembersModal({ onClose }: { onClose: () => void }) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [inviting, setInviting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "sent" | "error">>({});

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sendInvite = useCallback(async (memberId: string) => {
    const email = emails[memberId]?.trim();
    if (!email) return;
    setInviting(memberId);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, memberId }),
      });
      if (res.ok) {
        setResults((p) => ({ ...p, [memberId]: "sent" }));
        setExpanded(null);
      } else {
        setResults((p) => ({ ...p, [memberId]: "error" }));
      }
    } catch {
      setResults((p) => ({ ...p, [memberId]: "error" }));
    } finally {
      setInviting(null);
    }
  }, [emails]);

  const byRole: Record<string, MemberRow[]> = {};
  members.forEach((m) => {
    if (!byRole[m.role]) byRole[m.role] = [];
    byRole[m.role].push(m);
  });

  const linkedCount = members.filter((m) => m.linked || results[m.id] === "sent").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: "var(--app-surface)",
          borderColor: "var(--app-border)",
          maxHeight: "80vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--app-border)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
              Band Members
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
              {linkedCount}/{members.length} accounts linked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5"
            style={{ color: "var(--app-text-muted)" }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--app-text-muted)" }}>
              Loading…
            </p>
          ) : (
            ROLE_ORDER.map((role) => {
              const roleMembers = byRole[role];
              if (!roleMembers?.length) return null;
              return (
                <div key={role}>
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--app-text-muted)", opacity: 0.6 }}
                  >
                    {getRoleDisplayName(role as Role)} · {roleMembers.length}
                  </p>
                  <div className="space-y-1">
                    {roleMembers.map((member) => (
                      <MemberInviteRow
                        key={member.id}
                        member={member}
                        expanded={expanded === member.id}
                        email={emails[member.id] ?? ""}
                        inviting={inviting === member.id}
                        result={results[member.id]}
                        onToggle={() =>
                          setExpanded((p) => (p === member.id ? null : member.id))
                        }
                        onEmailChange={(v) =>
                          setEmails((p) => ({ ...p, [member.id]: v }))
                        }
                        onInvite={() => sendInvite(member.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MemberInviteRow({
  member,
  expanded,
  email,
  inviting,
  result,
  onToggle,
  onEmailChange,
  onInvite,
}: {
  member: MemberRow;
  expanded: boolean;
  email: string;
  inviting: boolean;
  result?: "sent" | "error";
  onToggle: () => void;
  onEmailChange: (v: string) => void;
  onInvite: () => void;
}) {
  const isLinked = member.linked || result === "sent";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: "var(--app-surface-hover)" }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-1 text-sm" style={{ color: "var(--app-text)" }}>
          {member.name}
        </span>

        {isLinked ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(63,185,80,0.1)", color: "#3fb950" }}
          >
            {result === "sent" ? "Invite sent" : "Linked"}
          </span>
        ) : (
          <button
            onClick={onToggle}
            className="text-xs px-2.5 py-1 rounded-md border transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
          >
            {expanded ? "Cancel" : "Invite"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 flex items-center gap-2">
          <input
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && email.trim()) onInvite();
            }}
            autoFocus
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
            style={{
              backgroundColor: "var(--app-bg)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
          />
          <button
            onClick={onInvite}
            disabled={!email.trim() || inviting}
            className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}
          >
            {inviting ? "…" : "Send"}
          </button>
          {result === "error" && (
            <span className="text-xs" style={{ color: "#f85149" }}>
              Failed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
