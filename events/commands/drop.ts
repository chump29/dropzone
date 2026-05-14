import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { info } from "@postfmly/logger"

import { dropLoot } from "../../utils/loadTimer.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Drop loot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await dropLoot(true).then(
    async (): Promise<InteractionResponse> =>
      await interaction.reply({
        content: "-# > 💰 Loot dropped",
        flags: MessageFlags.Ephemeral
      })
  )

  if (Bun.env.DEBUG) {
    info("Loot dropped")
  }
}

export { create, invoke }
