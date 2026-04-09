import { readdir } from "fs/promises";

import { type CacheType, type ChatInputCommandInteraction, type Client } from "discord.js";

interface IEventFile {
  invoke(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
  NAME: string;
  ONCE: boolean;
}

const loadCommand = async (client: Client, event: string): Promise<void> => {
  const eventFile: IEventFile = await import(`${__dirname}/${event}`);
  if (eventFile.ONCE) {
    client.once(eventFile.NAME, async (interaction: ChatInputCommandInteraction): Promise<void> => {
      await eventFile.invoke(interaction);
    });
  } else {
    client.on(eventFile.NAME, async (interaction: ChatInputCommandInteraction): Promise<void> => {
      await eventFile.invoke(interaction);
    });
  }
};

const loadCommands = async (client: Client): Promise<void> => {
  const events: string[] = await readdir(`${__dirname}`).then((dir: string[]) => {
    return dir.filter((file: string) => file.endsWith(".ts")).map((file) => file.slice(0, -3));
  });

  for (const event of events) {
    await loadCommand(client, event);
  }
};

export default loadCommands;
