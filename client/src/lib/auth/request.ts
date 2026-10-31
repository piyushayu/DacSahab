import "server-only";

import { headers } from "next/headers";

import type { SessionMeta } from "./types";

export async function requestMeta(): Promise<SessionMeta> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  return {
    ip: forwarded?.split(",")[0]?.trim() || headerStore.get("x-real-ip"),
  };
}
