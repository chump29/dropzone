import { parse } from "path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { type ILoot } from "../../db/schema.ts"
import { checkRate } from "../../utils/checkRate.ts"
import { listLoot } from "../../utils/database.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("List loot")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .toJSON()
}

const getFields = async (): Promise<APIEmbedField[]> => {
  return await listLoot().then((loot: ILoot[]): APIEmbedField[] => {
    const fields: APIEmbedField[] = [
      {
        name: "_ _",
        value: ""
      } as APIEmbedField
    ]
    loot.forEach((item: ILoot): void => {
      const cost: string = item.min === item.max ? item.min.toString() : `${item.min} - $${item.max}`
      fields.push({
        inline: true,
        name: item.name,
        value: `-# $${cost}`
      } as APIEmbedField)
    })
    return fields
  })
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction
    .reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        new EmbedBuilder()
          .setColor("#78866b")
          .setTitle(`💰  ${Bun.env.NAME} Loot  💰`)
          .setFields(await getFields())
          .toJSON()
      ]
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info("Listed loot")
  }
}

export { create, invoke }
