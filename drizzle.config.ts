import type { Config } from "drizzle-kit";

export default {
	schema: "./src/drizzle/schema.ts",
	out: "./src/drizzle/migrations",
	dialect: "sqlite",
	driver: "turso",
	// seems there is issue with drizzle-kit https://github.com/drizzle-team/drizzle-orm/issues/2719
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
} satisfies Config;
