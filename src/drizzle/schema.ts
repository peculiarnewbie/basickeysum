import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const keysums = sqliteTable("foo", {
	key: text("key").notNull().primaryKey(),
	sum: integer("sum").notNull().default(0),
});
