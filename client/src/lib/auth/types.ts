export type AccountKind = "USER" | "DOCTOR";
export type AppRole = "PATIENT" | "DOCTOR" | "ADMIN";

export type AccessClaims = {
  sub: string;
  kind: AccountKind;
  role: AppRole;
  onboarded: boolean;
  tokenVersion: number;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

export type RefreshClaims = {
  sub: string;
  kind: AccountKind;
  jti: string;
  tokenVersion: number;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

export type SessionAccount = {
  id: string;
  kind: AccountKind;
  role: AppRole;
  onboarded: boolean;
  tokenVersion: number;
};

export type SessionMeta = {
  ip?: string | null;
};
