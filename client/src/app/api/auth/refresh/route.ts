import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE } from "@/lib/auth/config";
import { clearAuthCookies } from "@/lib/auth/cookies";
import {
  RefreshRaceError,
  rotateSession,
} from "@/lib/auth/session";

function safeNext(value: string | null): string {
  if (!value) return "/auth/continue";
  if (!value.startsWith("/") || value.startsWith("//")) return "/auth/continue";
  if (value.startsWith("/api/auth")) return "/auth/continue";
  return value;
}

function clientIp(value: string | null): string | null {
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

async function readNext(request: NextRequest): Promise<string> {
  const fromQuery = request.nextUrl.searchParams.get("next");
  if (fromQuery) return safeNext(fromQuery);

  if (request.method === "POST") {
    try {
      const body = (await request.json()) as { next?: unknown };
      if (typeof body.next === "string") return safeNext(body.next);
    } catch {
      // No JSON body is fine.
    }
  }

  return "/auth/continue";
}

async function rotate(request: NextRequest): Promise<Response> {
  const raw = request.cookies.get(REFRESH_COOKIE)?.value;
  const next = await readNext(request);

  if (!raw) {
    if (request.method === "GET") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const headerStore = await headers();

  try {
    await rotateSession(raw, {
      userAgent: headerStore.get("user-agent"),
      ip: clientIp(
        headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip"),
      ),
    });

    if (request.method === "GET") {
      return NextResponse.redirect(new URL(next, request.url));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RefreshRaceError) {
      if (request.method === "GET") {
        // The other tab has already written the new cookie.
        return NextResponse.redirect(new URL(next, request.url));
      }
      return NextResponse.json({ code: "REFRESH_RACE" }, { status: 401 });
    }

    await clearAuthCookies();

    if (request.method === "GET") {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", next);
      return NextResponse.redirect(login);
    }

    return NextResponse.json({ code: "INVALID_REFRESH" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  return rotate(request);
}

export async function POST(request: NextRequest) {
  return rotate(request);
}
