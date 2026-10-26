import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { readPendingRoleCookie } from "@/lib/auth/cookies";
import {
  handleGoogleSignIn,
  type GoogleAccount,
  type GoogleProfile,
} from "@/lib/auth/google";

const googleClientId = process.env.AUTH_GOOGLE_ID ?? "not-configured";
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? "not-configured";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Auth.js is only the Google OAuth client. It is never used for
  // email/password authentication and its session is a 60-second handoff.
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return false;

      const googleProfile = profile as GoogleProfile | undefined;
      const verified =
        googleProfile?.email_verified === true ||
        (googleProfile?.email_verified as unknown) === "true";

      if (!googleProfile?.email || !verified) return false;

      try {
        const pendingRole = await readPendingRoleCookie();
        const result = await handleGoogleSignIn({
          account: account as unknown as GoogleAccount,
          profile: googleProfile,
          pendingRole: pendingRole === "doctor" ? "DOCTOR" : "USER",
        });

        // Carry our own account id through the one-time Auth.js token.
        user.id = result.id;
        user.appKind = result.kind;
        return true;
      } catch (error) {
        console.error("[auth] Google sign-in failed", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.appSub = user.id;
        token.appKind = user.appKind;
      }
      return token;
    },

    async session({ session, token }) {
      session.appSub =
        typeof token.appSub === "string" ? token.appSub : undefined;
      session.appKind =
        token.appKind === "USER" || token.appKind === "DOCTOR"
          ? token.appKind
          : undefined;
      return session;
    },
  },
});
