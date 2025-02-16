import { Hono } from "hono";
import { initBetterAuth } from "./lib/auth";

const app = new Hono();

app.on(["POST", "GET"], "/auth/*", (c) => {
	const auth = initBetterAuth(c.env);

	return auth.handler(c.req.raw);
});

const router = app.get("/", (c) => {
	return c.text("Hello Hono!");
});

export type Router = typeof router;

export default app;
