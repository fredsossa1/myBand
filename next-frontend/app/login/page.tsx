"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, { error: null });

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 text-lg font-bold" style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}>
            ♪
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--app-text)" }}>Band Availability</h1>
          <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--app-text)" }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500/50 transition-colors"
                style={{
                  backgroundColor: "var(--app-bg)",
                  borderColor: "var(--app-border)",
                  color: "var(--app-text)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--app-text)" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500/50 transition-colors"
                style={{
                  backgroundColor: "var(--app-bg)",
                  borderColor: "var(--app-border)",
                  color: "var(--app-text)",
                }}
              />
            </div>

            {state?.error && (
              <div role="alert" data-testid="login-error" className="rounded-lg px-3 py-2.5 text-sm" style={{ backgroundColor: "rgba(248, 81, 73, 0.1)", color: "#f85149", border: "1px solid rgba(248, 81, 73, 0.2)" }}>
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--app-text-muted)" }}>
          No account? Ask your admin to send you an invite.
        </p>
      </div>
    </div>
  );
}
