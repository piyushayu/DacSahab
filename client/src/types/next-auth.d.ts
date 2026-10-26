import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    appKind?: "USER" | "DOCTOR";
  }

  interface Session {
    appSub?: string;
    appKind?: "USER" | "DOCTOR";
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appSub?: string;
    appKind?: "USER" | "DOCTOR";
  }
}
