import { existsSync } from "node:fs";
import type { Adapter, BetterAuthOptions } from "better-auth";
import { type FieldAttribute, getAuthTables } from "better-auth/db";
export type SchemaGenerator = (opts: {
	file?: string;
	adapter: Adapter;
	options: BetterAuthOptions;
}) => Promise<{
	code?: string;
	fileName: string;
	overwrite?: boolean;
	append?: boolean;
}>;

export function convertToSnakeCase(str: string) {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export const generateDrizzleSchema: SchemaGenerator = async ({ options, file, adapter }) => {
	const tables = getAuthTables(options);
	const filePath = file || "./auth-schema.ts";
	const databaseType = adapter.options?.provider;
	const usePlural = adapter.options?.usePlural;
	const timestampAndBoolean = databaseType !== "sqlite" ? "timestamp, boolean" : "";
	const int = databaseType === "mysql" ? "int" : "integer";
	const hasBigint = Object.values(tables).some((table) => Object.values(table.fields).some((field) => field.bigint));
	const bigint = databaseType !== "sqlite" ? "bigint" : "";
	const text = databaseType === "mysql" ? "varchar, text" : "text";
	let code = `import { ${databaseType}Table, ${text}, ${int}${hasBigint ? `, ${bigint}` : ""}, ${timestampAndBoolean} } from "drizzle-orm/${databaseType}-core";
			`;

	const fileExist = existsSync(filePath);

	for (const table in tables) {
		const modelName = usePlural ? `${tables?.[table]?.modelName}s` : tables?.[table]?.modelName;
		const fields = tables?.[table]?.fields;
		function getType(name: string, field: FieldAttribute) {
			const formattedName = convertToSnakeCase(name);
			const type = field.type;
			const typeMap = {
				string: {
					sqlite: `text('${formattedName}')`,
					pg: `text('${formattedName}')`,
					mysql: field.unique ? `varchar('${formattedName}', { length: 255 })` : field.references ? `varchar('${formattedName}', { length: 36 })` : `text('${formattedName}')`
				},
				boolean: {
					sqlite: `integer('${formattedName}', { mode: 'boolean' })`,
					pg: `boolean('${formattedName}')`,
					mysql: `boolean('${formattedName}')`
				},
				number: {
					sqlite: `integer('${formattedName}')`,
					pg: field.bigint ? `bigint('${formattedName}', { mode: 'number' })` : `integer('${formattedName}')`,
					mysql: field.bigint ? `bigint('${formattedName}', { mode: 'number' })` : `int('${formattedName}')`
				},
				date: {
					sqlite: `integer('${formattedName}', { mode: 'timestamp' })`,
					pg: `timestamp('${formattedName}')`,
					mysql: `timestamp('${formattedName}')`
				}
			} as const;
			return typeMap[type as "boolean"][(databaseType as "sqlite") || "sqlite"];
		}
		const id = databaseType === "mysql" ? `varchar("id", { length: 36 }).primaryKey()` : `text("id").primaryKey()`;
		const schema = `export const ${modelName}Table = ${databaseType}Table("${convertToSnakeCase(modelName ?? "")}", {
					id: ${id},
					${Object.keys(fields ?? {})
						.map((field) => {
							const attr = fields?.[field];
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							return `${field}: ${getType(field, attr as any)}${attr?.required ? ".notNull()" : ""}${attr?.unique ? ".unique()" : ""}${
								attr?.references ? `.references(()=> ${usePlural ? `${attr.references.model}sTable` : `${attr.references.model}Table`}.${attr.references.field})` : ""
							}`;
						})
						.join(",\n ")}
				});`;
		code += `\n${schema}\n`;
	}

	return {
		code: code,
		fileName: filePath,
		overwrite: fileExist
	};
};
