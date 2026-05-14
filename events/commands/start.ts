import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { RUNNING, startTimer } from "../../utils/loadTimer.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Start dropping loot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (RUNNING) {
    await interaction.reply({
      content: `-# > ❌ ${Bun.env.NAME} is already started`,
      flags: MessageFlags.Ephemeral
    })
    return
  }

  await startTimer().then(
    async (): Promise<InteractionResponse> =>
      await interaction.reply({
        content: `-# > ▶️ ${Bun.env.NAME} started`,
        flags: MessageFlags.Ephemeral
      })
  )
}

export { create, invoke }
