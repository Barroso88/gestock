import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleAuthConfigured } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=credentials_missing", request.url)
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectPath = searchParams.get("redirect") || "/";

  const googleUrl = getGoogleAuthUrl(redirectPath);
  return NextResponse.redirect(googleUrl);
}
