"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
    >
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, { error: null });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-white/10">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Band Availability
          </CardTitle>
          <p className="text-white/60 text-sm">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
              />
            </div>

            {state?.error && (
              <p className="text-red-300 text-sm bg-red-900/30 rounded-md px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>
          <p className="text-center text-white/40 text-xs mt-6">
            No account? Ask your admin to send you an invite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
