import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, verifyPassword, requireAuth } from "../lib/auth.js";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user || !verifyPassword(parsed.data.password, user.password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
    token,
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const isFirstUser = (await db.select().from(usersTable)).length === 0;
  const [user] = await db
    .insert(usersTable)
    .values({
      email: parsed.data.email,
      password: hashPassword(parsed.data.password),
      name: parsed.data.name,
      role: isFirstUser ? "admin" : "user",
    })
    .returning();

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
    token,
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt });
});

export default router;
