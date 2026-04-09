import { type Client } from "discord.js";

import loadCommands from "./events/loadCommands";
import botClient from "./utils/botClient";
import { openDatabase } from "./utils/database";
import loadTimer from "./utils/loadTimer";
import { info } from "./utils/logger";

const CLIENT: Client = await botClient();

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(CLIENT))
  .then(async (): Promise<string> => await CLIENT.login(Bun.env.TOKEN))
  .then(async (): Promise<void> => await loadTimer(CLIENT))
  .then((): void => info("Running..."));
