import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./src/db/schemas.ts", "./src/db/better-auth-schemas.ts"],
	out: "./migrations",
	dialect: "sqlite",
	driver: "d1-http"
});
