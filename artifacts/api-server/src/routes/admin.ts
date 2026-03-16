import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth.js";
import { exec } from "child_process";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.post("/admin/update", requireAdmin, (_req, res): void => {
  exec("git pull origin main 2>&1", { cwd: process.cwd() }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout || stderr || (error ? error.message : "Update complete"),
    });
  });
});

export default router;
