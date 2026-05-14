import { parse } from "node:path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { checkRate } from "@postfmly/checkrate"
import { info } from "@postfmly/logger"

import { type ILoot } from "../../db/schema.ts"
import { LOOT } from "../../utils/loadTimer.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("List loot")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .toJSON()
}

const getFields = async (): Promise<APIEmbedField[]> => {
  const fields: APIEmbedField[] = [
    {
      name: "_ _",
      value: ""
    } as APIEmbedField
  ]
  LOOT.forEach((item: ILoot): void => {
    const cost: string = item.min === item.max ? item.min.toString() : `${item.min} - $${item.max}`
    fields.push({
      inline: true,
      name: item.name,
      value: `-# $${cost}`
    } as APIEmbedField)
  })
  return fields
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    embeds: [
      new EmbedBuilder()
        .setColor("#78866b")
        .setTitle(`💰  ${Bun.env.NAME} Loot  💰`)
        .setFields(await getFields())
        .toJSON()
    ]
  })

  if (Bun.env.DEBUG) {
    info("Listed loot")
  }
}

export { create, invoke }
