import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { startDrop } from "../../utils/loadTimer.ts";
import { error, info } from "../../utils/logger.ts";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("start").setDescription("Start DropZoneBot").toJSON();
};

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  startDrop();

  await interaction
    .reply({
      content: "-# > ▶️ DropZoneBot started",
      flags: MessageFlags.SuppressNotifications
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e);
      throw e;
    });

  if (Bun.env.DEBUG) {
    info("Started");
  }
};

export { create, invoke };
