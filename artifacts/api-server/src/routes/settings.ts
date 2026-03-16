import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";
import { UpdateSettingBody, UpdateSettingParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(settingsTable);
  res.json(settings);
});

router.put("/settings/:key", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateSettingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateSettingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.key, params.data.key));
  if (existing) {
    const [updated] = await db
      .update(settingsTable)
      .set({ valueAr: body.data.valueAr, valueEn: body.data.valueEn })
      .where(eq(settingsTable.key, params.data.key))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(settingsTable)
      .values({ key: params.data.key, valueAr: body.data.valueAr, valueEn: body.data.valueEn })
      .returning();
    res.json(created);
  }
});

export default router;
