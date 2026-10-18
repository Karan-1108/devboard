import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/require-auth.js";

const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in 15 minutes." },
});

const credentialsSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password is too long.",
      ),
  })
  .strict();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing.");
  return secret;
}

function setAuthCookie(response: import("express").Response, userId: string) {
  const token = jwt.sign({}, getJwtSecret(), {
    subject: userId,
    expiresIn: "7d",
    issuer: "devboard-api",
    audience: "devboard-web",
  });

  response.cookie("devboard_token", token, cookieOptions);
}

authRouter.post("/register", authLimiter, async (request, response, next) => {
  try {
    const parsed = credentialsSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({ error: "Invalid email or password." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return response
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    setAuthCookie(response, user.id);
    return response.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", authLimiter, async (request, response, next) => {
  try {
    const parsed = credentialsSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({ error: "Invalid email or password." });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }

    setAuthCookie(response, user.id);

    return response.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/logout", (_request, response) => {
  response.clearCookie("devboard_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response.json({ message: "Logged out." });
});

authRouter.get("/me", requireAuth, async (_request, response, next) => {
  try {
    const userId = response.locals.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      response.clearCookie("devboard_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response.status(401).json({ error: "Authentication required." });
    }

    return response.json({ user });
  } catch (error) {
    return next(error);
  }
});

export default authRouter;