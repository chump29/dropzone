import { ActivityType, Client, GatewayIntentBits } from "discord.js";

import { close } from "./database.ts";
import { info } from "./logger.ts";

const botClient = async (): Promise<Client> => {
  const client: Client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions
    ],
    presence: {
      activities: [
        {
          name: "Dropping loot",
          type: ActivityType.Custom
        }
      ]
    }
  });

  process.on("SIGINT", () => {
    info("Shutting down...");
    close();
    client.destroy().then((): void => {
      process.exit();
    });
  });

  return client;
};

export default botClient;
