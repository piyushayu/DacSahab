import { NextResponse, type NextRequest } from "next/server";

import { revokeCurrentSession } from "@/lib/auth/session";

function safeRedirect(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/api/auth")) return null;
  return value;
}

async function readRedirect(request: NextRequest): Promise<string | null> {
  const query = request.nextUrl.searchParams.get("redirect");
  if (query) return safeRedirect(query);

  if (request.method !== "POST") return null;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("form")) return null;

  const form = await request.formData().catch(() => null);
  const value = form?.get("redirect");
  return typeof value === "string" ? safeRedirect(value) : null;
}

async function logout(request: NextRequest): Promise<Response> {
  const redirectTo = await readRedirect(request);

  // The refresh cookie is scoped to /api/auth, so this route can revoke it
  // even though a Server Action rendered on /dashboard cannot.
  await revokeCurrentSession();

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url), 303);
  }

  if (request.method === "GET") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  return logout(request);
}

export async function GET(request: NextRequest) {
  return logout(request);
}
