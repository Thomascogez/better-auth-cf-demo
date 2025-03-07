import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, magicLink } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";

export const initBetterAuth = (env: Env) => {
	return betterAuth({
		database: drizzleAdapter(drizzle(env.DB), {
			provider: "sqlite",
		}),
		trustedOrigins: env.TRUSTED_ORIGINS,
		secondaryStorage: {
			get(key) {
				return env.KV.get(key);
			},
			set(key, value, ttl) {
				return env.KV.put(key, value, { expirationTtl: ttl });
			},
			delete(key) {
				return env.KV.delete(key);
			}
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_BASE_URL,
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, token, url }, request) => {
					console.log(url);
				}
			}),
			admin()
		]
	});
};
