import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import { close } from "./database.ts"
import { info } from "./logger.ts"
import { SERVER } from "./logo.ts"

let CLIENT: Client | null = null

const shutdown = async (): Promise<void> => {
  info("Shutting down...")
  await close()
    .then(async (): Promise<void> => await CLIENT?.destroy())
    .then(async (): Promise<void> => await SERVER?.stop(true))
    .then((): void => process.exit())
}

const client = async (): Promise<Client> => {
  CLIENT = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions
    ],
    presence: {
      activities: [
        {
          name: "Dropping loot...",
          type: ActivityType.Custom
        }
      ]
    }
  })

  process.on("SIGINT", async (): Promise<void> => {
    await shutdown()
  })

  process.on("SIGTERM", async (): Promise<void> => {
    await shutdown()
  })

  return CLIENT
}

const login = async (): Promise<void> => {
  if (!CLIENT) {
    throw new Error("Invalid client")
  }

  await CLIENT.login(Bun.env.TOKEN)

  if (CLIENT.user && Bun.env.DEBUG) {
    info(`Connected as ${CLIENT.user.displayName} (${CLIENT.user.tag})`)
  }
}

export { client, login, shutdown }
