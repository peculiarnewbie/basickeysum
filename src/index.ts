import { Hono } from "hono";
import { getDB } from "./drizzle/db";
import { keysums } from "./drizzle/schema";
import { AnyColumn, sql } from "drizzle-orm";

type Bindings = {
	TURSO_DB_URL: string;
	TURSO_DB_TOKEN: string;
};

const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/keysum", async (c) => {
	const db = getDB(c.env.TURSO_DB_URL, c.env.TURSO_DB_TOKEN);

	const res = await db.select().from(keysums).all();

	return c.json(res);
});

app.post("/keysum/post", async (c) => {
	const body = await c.req.json();
	const pairs: [string, number][] = Object.entries(body);
	console.log(pairs);

	const db = getDB(c.env.TURSO_DB_URL, c.env.TURSO_DB_TOKEN);

	const values = pairs.map(([key, sum]) => ({ key, sum }));

	const res = await db
		.insert(keysums)
		.values(values)
		.onConflictDoUpdate({
			target: keysums.key,
			set: { sum: sql`${keysums.sum} + excluded.${keysums.sum}` },
		});
});

export default app;
