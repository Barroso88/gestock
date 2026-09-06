import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const SESSION_COOKIE_NAME = "gestock_session";
const SESSION_DURATION_DAYS = 30;

import { NextRequest } from "next/server";

export function isGoogleAuthConfigured(): boolean {
  return (
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0
  );
}

export function getBaseUrl(request?: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, "");
  }

  if (request) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (host && !host.startsWith("0.0.0.0") && !host.startsWith("127.0.0.1") && host !== "localhost") {
      return `${proto}://${host}`;
    }
  }

  return "https://stock.barrosoportal.com";
}

export function getRedirectUri(request?: NextRequest, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl || getBaseUrl(request);
  return `${baseUrl}/api/auth/callback/google`;
}

/**
 * Gera a URL oficial de consentimento da Google para OAuth 2.0
 */
export function getGoogleAuthUrl(state?: string, customBaseUrl?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = getRedirectUri(undefined, customBaseUrl);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.append("state", state);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca o código de autorização da Google pelo token de acesso
 */
export async function exchangeGoogleCode(code: string, customBaseUrl?: string): Promise<{
  access_token: string;
  id_token?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = getRedirectUri(undefined, customBaseUrl);

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Falha ao trocar código do Google: ${errorBody}`);
  }

  return res.json();
}

/**
 * Obtém os dados de perfil do utilizador a partir da API Google UserInfo
 */
export async function getGoogleUserProfile(accessToken: string): Promise<{
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Falha ao obter dados de perfil da Google.");
  }

  return res.json();
}

/**
 * Cria ou atualiza o utilizador na base de dados e inicia uma sessão em cookie
 */
export async function createOrUpdateUserAndSession(profile: {
  email: string;
  name?: string | null;
  picture?: string | null;
}) {
  const email = profile.email.toLowerCase().trim();

  // 1. Cria ou atualiza o Utilizador
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: profile.name || undefined,
      image: profile.picture || undefined,
    },
    create: {
      email,
      name: profile.name || email.split("@")[0],
      image: profile.picture || null,
      role: "ADMIN",
    },
  });

  // 2. Gera um token criptograficamente seguro para a sessão
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt,
    },
  });

  // 3. Define o cookie seguro
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return user;
}

/**
 * Devolve o utilizador autenticado atual através do cookie de sessão
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || new Date() > session.expiresAt) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Erro ao verificar sessão do utilizador:", error);
    return null;
  }
}

/**
 * Encerra a sessão do utilizador
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Erro ao terminar sessão:", error);
  }
}
