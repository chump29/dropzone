import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { stopDrop } from "../../utils/loadTimer.ts";
import { error, info } from "../../utils/logger.ts";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("stop").setDescription("Stop DropZoneBot").toJSON();
};

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  stopDrop();

  await interaction
    .reply({
      content: "-# > ⏹️ DropZoneBot stopped",
      flags: MessageFlags.SuppressNotifications
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e);
      throw e;
    });

  if (Bun.env.DEBUG) {
    info("Stopped");
  }
};

export { create, invoke };
