import { type Client } from "discord.js";

import loadCommands from "./events/loadCommands.ts";
import botClient from "./utils/botClient.ts";
import { loadLoot, openDatabase } from "./utils/database.ts";
import { loadTimer } from "./utils/loadTimer.ts";
import { info } from "./utils/logger.ts";

const CLIENT: Client = await botClient();

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(CLIENT))
  .then(async (): Promise<string> => await CLIENT.login(Bun.env.TOKEN))
  .then(async (): Promise<void> => await loadLoot())
  .then(async (): Promise<void> => await loadTimer(CLIENT))
  .then((): void => info("Running..."));
