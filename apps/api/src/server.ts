import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.routes.js";
import { requireTrustedOrigin } from "./middleware/require-trusted-origin.js";
import applicationsRouter from "./routes/applications.routes.js";

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", message: "DevBoard API is running" });
});

app.get("/api/health/db", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok", database: "connected" });
  } catch {
    response.status(503).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error("Unhandled API error:", error);
    response.status(500).json({ error: "Internal server error." });
  },
);

app.listen(port, host, () => {
  console.log(`DevBoard API is running at http://${host}:${port}`);
});