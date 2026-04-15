import { type Client } from "discord.js"

import { loadCommands } from "./events/loadCommands.ts"
import { client, login, shutdown } from "./utils/client.ts"
import { loadLoot, openDatabase } from "./utils/database.ts"
import { loadTimer } from "./utils/loadTimer.ts"
import { error, info } from "./utils/logger.ts"
import { logo } from "./utils/logo.ts"

const CLIENT: Client = await client()

Bun.env.DEBUG = Bun.env.IS_DEBUG === "true" ? true : false

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(CLIENT))
  .then(async (): Promise<void> => await login())
  .then(async (): Promise<void> => await loadLoot())
  .then(async (): Promise<void> => await loadTimer(CLIENT))
  .then(async (): Promise<void> => await logo())
  .then((): void => info("Running..."))
  // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  .catch(async (e: any): Promise<void> => {
    error(e)
    await shutdown()
  })
