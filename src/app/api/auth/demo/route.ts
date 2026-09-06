import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateUserAndSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "andre.barroso@gmail.com";
    const name = body.name || "André Barroso";
    const picture = body.picture || null;

    const user = await createOrUpdateUserAndSession({
      email,
      name,
      picture,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Erro no login de teste:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
