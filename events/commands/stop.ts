import { parse } from "path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { END, stopDrop } from "../../utils/loadTimer.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Stop dropping loot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!END) {
    await interaction
      .reply({
        content: `-# > ❌ ${Bun.env.NAME} is already stopped`,
        flags: MessageFlags.Ephemeral
      })
      .catch((e: unknown): void => {
        error(e)
        throw e
      })
    return
  }

  stopDrop()

  await interaction
    .reply({
      content: `-# > ⏹️ ${Bun.env.NAME} stopped`,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { create, invoke }
