import { Router, type Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/require-auth.js";

const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

const applicationStatus = z.enum([
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
]);

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Enter a valid date.");

const companyField = z.string().trim().min(1).max(150);
const roleField = z.string().trim().min(1).max(150);
const notesField = z.string().trim().max(5000).nullable();
const applicationUrlField = z.union([
  z
    .string()
    .trim()
    .max(2048)
    .url("Enter a valid web address.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Application links must start with http:// or https://.",
    ),
  z.literal(""),
  z.null(),
]);

const createApplicationSchema = z
  .object({
    company: companyField,
    role: roleField,
    status: applicationStatus.default("APPLIED"),
    appliedAt: dateOnly.optional(),
    notes: notesField.optional(),
    applicationUrl: applicationUrlField.optional(),
  })
  .strict();

const updateApplicationSchema = z
  .object({
    company: companyField,
    role: roleField,
    status: applicationStatus,
    appliedAt: dateOnly,
    notes: notesField,
    applicationUrl: applicationUrlField.optional(),
  })
  .strict();

const listQuerySchema = z
  .object({
    status: applicationStatus.optional(),
    sortBy: z.enum(["appliedAt", "company", "status"]).default("appliedAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

function invalidInput(response: Response) {
  return response.status(400).json({ error: "Invalid application data." });
}

applicationsRouter.get("/", async (request, response, next) => {
  try {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) return invalidInput(response);

    const userId = response.locals.userId as string;
    const { status, sortBy, order } = query.data;

    const orderBy =
      sortBy === "company"
        ? { company: order }
        : sortBy === "status"
          ? { status: order }
          : { appliedAt: order };

    const applications = await prisma.application.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy,
    });

    return response.json({ applications });
  } catch (error) {
    return next(error);
  }
});

applicationsRouter.post("/", async (request, response, next) => {
  try {
    const input = createApplicationSchema.safeParse(request.body);
    if (!input.success) return invalidInput(response);

    const userId = response.locals.userId as string;
    const { appliedAt, applicationUrl, ...fields } = input.data;

    const application = await prisma.application.create({
      data: {
        ...fields,
        notes: fields.notes?.trim() || null,
        applicationUrl: applicationUrl?.trim() || null,
        ...(appliedAt
          ? { appliedAt: new Date(`${appliedAt}T00:00:00.000Z`) }
          : {}),
        userId,
      },
    });

    return response.status(201).json({ application });
  } catch (error) {
    return next(error);
  }
});

applicationsRouter.put("/:id", async (request, response, next) => {
  try {
    const input = updateApplicationSchema.safeParse(request.body);
    if (!input.success) return invalidInput(response);

    const userId = response.locals.userId as string;
    const id = request.params.id;
    const { applicationUrl, ...fields } = input.data;

    const updated = await prisma.application.updateMany({
      where: { id, userId },
      data: {
        ...fields,
        notes: fields.notes?.trim() || null,
        ...(applicationUrl !== undefined
          ? { applicationUrl: applicationUrl?.trim() || null }
          : {}),
        appliedAt: new Date(`${fields.appliedAt}T00:00:00.000Z`),
      },
    });

    if (updated.count === 0) {
      return response.status(404).json({ error: "Application not found." });
    }

    const application = await prisma.application.findFirst({
      where: { id, userId },
    });

    return response.json({ application });
  } catch (error) {
    return next(error);
  }
});

applicationsRouter.delete("/:id", async (request, response, next) => {
  try {
    const userId = response.locals.userId as string;
    const id = request.params.id;

    const deleted = await prisma.application.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return response.status(404).json({ error: "Application not found." });
    }

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default applicationsRouter;
