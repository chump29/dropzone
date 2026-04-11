import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { error } from "../../utils/logger.ts";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("info").setDescription("Information about DropZoneBot").toJSON();
};

const embed: EmbedBuilder = new EmbedBuilder()
  .setColor(0x78866b)
  .setTitle(`DropZoneBot v${Bun.env.npm_package_version}`)
  .setDescription("- Collect military items for cash!")
  .setFooter({
    text: "Chris Post"
  });

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction
    .reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        embed.toJSON()
      ]
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e);
      throw e;
    });
};

export { create, invoke };
