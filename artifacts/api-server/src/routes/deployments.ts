import { Router, type IRouter } from "express";
import { db, deploymentsTable, servicesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { CreateDeploymentBody, GetDeploymentParams, DeleteDeploymentParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/deployments", requireAuth, async (req, res): Promise<void> => {
  const isAdmin = req.userRole === "admin";
  const rows = isAdmin
    ? await db.select().from(deploymentsTable).orderBy(deploymentsTable.createdAt)
    : await db.select().from(deploymentsTable).where(eq(deploymentsTable.userId, req.userId!)).orderBy(deploymentsTable.createdAt);

  const withService = await Promise.all(
    rows.map(async (d) => {
      const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, d.serviceId));
      return { ...d, service };
    })
  );

  res.json(withService);
});

router.post("/deployments", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateDeploymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.serviceId));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  const subdomain = `${user.email.split("@")[0].replace(/[^a-z0-9]/gi, "")}-${service.nameEn.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`;
  const domainUrl = `https://${subdomain}.owaar.com`;

  const [deployment] = await db
    .insert(deploymentsTable)
    .values({
      userId: req.userId!,
      serviceId: parsed.data.serviceId,
      status: "deploying",
      domainUrl,
    })
    .returning();

  setTimeout(async () => {
    await db
      .update(deploymentsTable)
      .set({ status: "running" })
      .where(eq(deploymentsTable.id, deployment.id));
  }, 3000);

  res.status(201).json({ ...deployment, service });
});

router.get("/deployments/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetDeploymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deployment] = await db.select().from(deploymentsTable).where(eq(deploymentsTable.id, params.data.id));
  if (!deployment) {
    res.status(404).json({ error: "Deployment not found" });
    return;
  }

  if (deployment.userId !== req.userId && req.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, deployment.serviceId));
  res.json({ ...deployment, service });
});

router.delete("/deployments/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteDeploymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deployment] = await db.select().from(deploymentsTable).where(eq(deploymentsTable.id, params.data.id));
  if (!deployment) {
    res.status(404).json({ error: "Deployment not found" });
    return;
  }

  if (deployment.userId !== req.userId && req.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(deploymentsTable).where(eq(deploymentsTable.id, params.data.id));
  res.json({ message: "Deployment removed" });
});

export default router;
