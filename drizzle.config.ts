import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Shell / deployment secrets take precedence over files.
// Match the Next.js convention of preferring .env.local to .env.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

// Use Neon's direct connection for schema changes when available.
// The application still uses the pooled DATABASE_URL in src/db/index.ts.
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "Configure DATABASE_URL (ou DATABASE_URL_UNPOOLED) no ambiente antes de usar o Drizzle Kit.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
