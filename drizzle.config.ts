import { defineConfig } from "drizzle-kit"

export default defineConfig({
  breakpoints: false,
  dialect: "sqlite",
  out: "./db",
  schema: "./db/schema.ts"
})
