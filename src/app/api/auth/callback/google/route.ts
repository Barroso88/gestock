import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  getGoogleUserProfile,
  createOrUpdateUserAndSession,
  getBaseUrl,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state") || "/";

  if (error || !code) {
    console.error("Erro no callback do Google OAuth:", error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "no_code")}`, baseUrl)
    );
  }

  try {
    // 1. Troca o código pelo access_token
    const tokens = await exchangeGoogleCode(code, baseUrl);

    // 2. Obtém os dados de perfil da Google
    const profile = await getGoogleUserProfile(tokens.access_token);

    if (!profile.email) {
      throw new Error("Não foi possível obter o endereço de email da conta Google.");
    }

    // 3. Cria/atualiza o utilizador e a sessão segura
    await createOrUpdateUserAndSession({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    const destination = state.startsWith("/") ? state : "/";
    return NextResponse.redirect(new URL(destination, baseUrl));
  } catch (err: any) {
    console.error("Falha ao autenticar com a Google:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || "auth_failed")}`, baseUrl)
    );
  }
}
