import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js";

import { getAll, type IUser } from "../../utils/database";
import { error } from "../../utils/logger";

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder().setName("leaderboard").setDescription("Show DropZoneBot leaderboard").toJSON();
};

const getEmbed = async (): Promise<APIEmbedField[]> => {
  const fields: APIEmbedField[] = await getAll().then((users: IUser[]) => {
    const fields: APIEmbedField[] = [];
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
    fields.push({
      name: "Nothing to show",
      value: ""
    } as APIEmbedField);
  }
  return fields;
};

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction
    .reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x78866b)
          .setTitle("DropZoneBot Leaderboard")
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
