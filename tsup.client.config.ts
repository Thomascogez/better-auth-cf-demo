import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/client.ts"],
	format: ["esm"],
	dts: true,
	outDir: "dist-client",
	clean: true
});
