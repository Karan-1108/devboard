import type { NextFunction, Request, Response } from "express";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireTrustedOrigin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (safeMethods.has(request.method)) {
    return next();
  }

  const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:3000";
  const requestOrigin = request.get("origin");

  if (requestOrigin !== allowedOrigin) {
    return response.status(403).json({ error: "Request origin not allowed." });
  }

  return next();
}