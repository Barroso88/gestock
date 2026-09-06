import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await logoutUser();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  await logoutUser();
  return NextResponse.json({ success: true });
}
