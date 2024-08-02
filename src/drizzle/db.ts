import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const getClient = (dbURL: string, dbToken: string) => {
	return createClient({ url: dbURL, authToken: dbToken });
};

export const getDB = (dbURL: string, dbToken: string) => {
	const client = getClient(dbURL, dbToken);
	return drizzle(client);
};
