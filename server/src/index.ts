import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan";

import {
  requireAuth,
  requireKind,
  requireOnboarded,
  requireRole,
  requireVerifiedDoctor,
} from "./middleware/auth.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "dacsahab-api" });
});

app.get("/api/me", requireAuth, (request, response) => {
  response.json({ auth: request.auth });
});

app.get(
  "/api/patient/overview",
  requireAuth,
  requireKind("USER"),
  requireOnboarded,
  requireRole("PATIENT"),
  (request, response) => {
    response.json({
      ok: true,
      message: "Patient API access granted",
      accountId: request.auth?.sub,
    });
  },
);

app.get(
  "/api/doctor/overview",
  requireAuth,
  requireKind("DOCTOR"),
  requireOnboarded,
  requireRole("DOCTOR"),
  (request, response) => {
    response.json({
      ok: true,
      message: "Doctor API access granted",
      accountId: request.auth?.sub,
    });
  },
);

app.get(
  "/api/doctor/verified",
  requireAuth,
  requireKind("DOCTOR"),
  requireVerifiedDoctor,
  (request, response) => {
    response.json({
      ok: true,
      message: "Verified doctor API access granted",
      accountId: request.auth?.sub,
    });
  },
);

app.use((_request, response) => {
  response.status(404).json({ code: "NOT_FOUND" });
});

app.use(
  (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    console.error("[api] unhandled error", error);
    response.status(500).json({ code: "INTERNAL_ERROR" });
  },
);

app.listen(port, () => {
  console.log(`DacSahab API listening on http://localhost:${port}`);
});
