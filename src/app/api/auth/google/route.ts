import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleAuthConfigured, getBaseUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=credentials_missing", baseUrl)
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectPath = searchParams.get("redirect") || "/";

  const googleUrl = getGoogleAuthUrl(redirectPath, baseUrl);
  return NextResponse.redirect(googleUrl);
}
