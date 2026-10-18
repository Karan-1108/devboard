import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token: unknown = request.cookies?.devboard_token;

  if (typeof token !== "string") {
    return response.status(401).json({ error: "Authentication required." });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("JWT_SECRET is missing."));
  }

  try {
    const payload = jwt.verify(token, secret, {
      issuer: "devboard-api",
      audience: "devboard-web",
    });

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return response.status(401).json({ error: "Invalid or expired session." });
    }

    response.locals.userId = payload.sub;
    return next();
  } catch {
    return response.status(401).json({ error: "Invalid or expired session." });
  }
}