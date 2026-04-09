import { readdir } from "fs/promises";

import { type Client, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

import { info } from "../utils/logger";

interface ICommandFile {
  create(): RESTPostAPIChatInputApplicationCommandsJSONBody;
}

const ONCE: boolean = true;
const NAME: string = "clientReady";

const invoke = async (client: Client): Promise<void> => {
  const commands: string[] = await readdir(`${__dirname}/commands`).then((dir: string[]) => {
    return dir.filter((file: string) => file.endsWith(".ts")).map((file) => file.slice(0, -3));
  });

  const commandsArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  for (const command of commands) {
    const commandFile: ICommandFile = await import(`${__dirname}/commands/${command}`);
    commandsArray.push(commandFile.create());
    if (Bun.env.DEBUG) {
      info(`Loaded /${command} command`);
    }
  }
  client.application?.commands.set(commandsArray);

  if (Bun.env.DEBUG) {
    info(`Connected as ${client.user?.displayName} (${client.user?.tag})`);
  }
};

export { invoke, NAME, ONCE };
