import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import { close } from "./database.ts"
import { info } from "./logger.ts"
import { SERVER } from "./logo.ts"

let CLIENT: Client | null = null

const shutdown = async (client: Client): Promise<void> => {
  info("Shutting down...")
  await close()
    .then(async (): Promise<void> => await client.destroy())
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
    if (CLIENT) {
      await shutdown(CLIENT)
    }
  })

  process.on("SIGTERM", async (): Promise<void> => {
    if (CLIENT) {
      await shutdown(CLIENT)
    }
  })

  return CLIENT
}

const login = async (client: Client): Promise<void> => {
  await client.login(Bun.env.TOKEN)

  if (client.user && Bun.env.DEBUG) {
    info(`Connected as ${client.user.displayName} (${client.user.tag})`)
  }
}

export { client, login, shutdown }
