import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { clearLoot, loadLootData } from "../../utils/loadLootData";
import { error } from "../../utils/logger";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("reload").setDescription("Reload loot table").toJSON();
};

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await clearLoot().then(async (): Promise<void> => {
    await loadLootData();
  });

  await interaction
    .reply({
      content: "-# Loot table has been reloaded",
      flags: MessageFlags.Ephemeral
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e);
      throw e;
    });
};

export { create, invoke };
