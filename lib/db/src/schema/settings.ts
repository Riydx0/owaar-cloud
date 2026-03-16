import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  valueAr: text("value_ar").notNull().default(""),
  valueEn: text("value_en").notNull().default(""),
});

export const insertSettingSchema = createInsertSchema(settingsTable);
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;
