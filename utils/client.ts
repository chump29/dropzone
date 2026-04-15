import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import { close } from "./database.ts"
import { info } from "./logger.ts"
import { SERVER } from "./logo.ts"

const client = async (): Promise<Client> => {
  const client: Client = new Client({
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

  const shutdown = async (): Promise<void> => {
    info("Shutting down...")
    await close()
      .then(async (): Promise<void> => await client.destroy())
      .then(async (): Promise<void> => await SERVER?.stop(true))
      .then((): void => process.exit())
  }

  process.on("SIGINT", async (): Promise<void> => {
    await shutdown()
  })

  process.on("SIGTERM", async (): Promise<void> => {
    await shutdown()
  })

  return client
}

const login = async (client: Client): Promise<void> => {
  await client.login(Bun.env.TOKEN)

  if (client.user && Bun.env.DEBUG) {
    info(`Connected as ${client.user.displayName} (${client.user.tag})`)
  }
}

export { client, login }
