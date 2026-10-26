import type { AccessClaims } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessClaims;
    }
  }
}

export {};
