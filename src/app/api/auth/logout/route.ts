import { NextRequest, NextResponse } from "next/server";
import { logoutUser, getBaseUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await logoutUser();
  return NextResponse.redirect(new URL("/login", getBaseUrl(request)));
}

export async function POST(request: NextRequest) {
  await logoutUser();
  return NextResponse.json({ success: true });
}
