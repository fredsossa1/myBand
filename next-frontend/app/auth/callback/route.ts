import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validate next to prevent open redirect (must be a relative path)
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Link auth user to their member record if member_id is in metadata
  const memberId = data.user.user_metadata?.member_id as string | undefined;
  if (memberId) {
    const { error: linkError } = await supabase
      .from("members")
      .update({ user_id: data.user.id })
      .eq("id", memberId)
      .is("user_id", null); // only link if not already linked
    if (linkError) {
      console.error("Failed to link member record:", linkError.message);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
