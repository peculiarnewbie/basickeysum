import { Hono } from "hono";
import { getDB } from "./drizzle/db";
import { keysums } from "./drizzle/schema";
import { AnyColumn, eq, inArray, sql } from "drizzle-orm";

type Bindings = {
	TURSO_DB_URL: string;
	TURSO_DB_TOKEN: string;
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

app.get("/keysum/post", async (c) => {
	return c.html(`
		<form method="post" action="/keysum/post/form">
			<input type="text" name="key" />
			<input type="number" name="sum" />
			<button type="submit">Submit</button>
		</form>`);
});

app.post("/keysum/post/form", async (c) => {
	const body = await c.req.parseBody();

	console.log("on form post", body);
	const { key, sum } = body;

	const values = {};
	//@ts-expect-error
	values[key] = sum;

	const url = new URL(c.req.url);
	const postURL = url.origin + "/keysum/post";

	const res = await fetch(postURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(values),
	});

	if (res.status !== 200) {
		return c.text("Error");
	}

	return c.json(res);
});

app.get("/keysum/:key", async (c) => {
	const db = getDB(c.env.TURSO_DB_URL, c.env.TURSO_DB_TOKEN);

	const res = await db
		.select()
		.from(keysums)
		.where(eq(keysums.key, c.req.param("key")))
		.all();

	return c.json(res);
});

app.post("/keysum/post", async (c) => {
	const body = await c.req.json();
	console.log(body);
	const pairs: [string, number][] = Object.entries(body);
	const keys = pairs.map(([key]) => key);

	const db = getDB(c.env.TURSO_DB_URL, c.env.TURSO_DB_TOKEN);

	const currentValues = await db
		.select()
		.from(keysums)
		.where(inArray(keysums.key, keys))
		.all();

	const values = pairs.map(([key, sum]) => {
		const currentValue = currentValues.find(({ key: k }) => k === key)?.sum;
		const value = currentValue ? currentValue + sum : sum;
		return {
			key: key,
			sum: value,
		};
	});

	const res = await db
		.insert(keysums)
		.values(values)
		.onConflictDoUpdate({
			target: keysums.key,
			set: {
				sum: sql.raw(`excluded.sum`),
			},
		})
		.returning();

	console.log("res", res);

	return c.json(res);
});

app.patch("keysum/post", async (c) => {
	const body = await c.req.json();
	console.log(body);
	const pairs: [string, number][] = Object.entries(body);
	const keys = pairs.map(([key]) => key);

	const values = pairs.map(([key, sum]) => ({ key: key, sum: sum }));

	const db = getDB(c.env.TURSO_DB_URL, c.env.TURSO_DB_TOKEN);

	const res = await db
		.insert(keysums)
		.values(values)
		.onConflictDoUpdate({
			target: keysums.key,
			set: {
				sum: sql.raw(`excluded.sum`),
			},
		})
		.returning();

	return c.json(res);
});

export default app;
