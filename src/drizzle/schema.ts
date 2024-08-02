import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const keysums = sqliteTable("keysums", {
	key: text("key").notNull().primaryKey(),
	sum: integer("sum").notNull().default(0),
});

export type SelectKeysums = typeof keysums.$inferSelect;
export type InsertKeysums = typeof keysums.$inferInsert;
