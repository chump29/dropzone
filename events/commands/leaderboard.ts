import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { getAll, type IUser } from "../../utils/database.ts";
import { error } from "../../utils/logger.ts";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("leaderboard").setDescription("Show DropZoneBot leaderboard").toJSON();
};

const BLANK: APIEmbedField = {
  name: "_ _",
  value: ""
};

const getEmbed = async (): Promise<APIEmbedField[]> => {
  const fields: APIEmbedField[] = await getAll().then((users: IUser[]) => {
    const fields: APIEmbedField[] = [];
    fields.push(BLANK);
    users.forEach((user: IUser) => {
      fields.push({
        inline: true,
        name: user.name,
        value: `-# $${user.points}`
      } as APIEmbedField);
    });
    return fields;
  });
  if (!fields.length) {
    fields.push(BLANK, {
      name: "Nothing to show",
      value: ""
    } as APIEmbedField);
  }
  return fields;
};

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction
    .reply({
      flags: MessageFlags.SuppressNotifications,
      embeds: [
        new EmbedBuilder()
          .setColor(0x78866b)
          .setTitle("🏆 DropZoneBot Leaderboard 🏆")
          .setFields(await getEmbed())
      ]
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e);
      throw e;
    });
};

export { create, invoke };
