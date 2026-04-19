import { parse } from "path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { type IUser } from "../../db/schema.ts"
import { checkRate } from "../../utils/checkRate.ts"
import { getAll } from "../../utils/database.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show leaderboard")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setContexts(InteractionContextType.Guild)
    .toJSON()
}

const getEmbed = async (): Promise<APIEmbedField[]> => {
  const fields: APIEmbedField[] = [
    {
      name: "_ _",
      value: ""
    } as APIEmbedField
  ]
  await getAll()
    .then((users: IUser[]): IUser[] => users.filter((user: IUser): boolean => user.points > 0))
    .then((users: IUser[]): void => {
      users.forEach((user: IUser, i: number) => {
        fields.push({
          inline: true,
          name: `${i === 0 ? "👑 " : ""}${user.name}`,
          value: `-# $${user.points}`
        } as APIEmbedField)
      })
    })
  return fields
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction
    .reply({
      flags: MessageFlags.SuppressNotifications,
      embeds: [
        new EmbedBuilder()
          .setColor("#78866b")
          .setTitle(`🏆  ${Bun.env.NAME} Leaderboard  🏆`)
          .setFields(await getEmbed())
          .toJSON()
      ]
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })
}

export { create, invoke }
