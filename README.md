## Better Auth Cloudflare Workers Demo

This is a proof of concept for making better-auth generation command work with Cloudflare environment using [cf-script](https://github.com/thomascogez/cf-script)

## How to test this

1. Clone this repo
2. Run `bun install` (or using your favorite package manager)
3. Run `bun run generate-better-auth-schemas` (or using your favorite package manager)
4. Check out the generated file `src/db/better-auth-schemas.ts`
