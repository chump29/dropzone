import { parse } from "path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { checkRate } from "../../utils/checkRate.ts"
import { stopDrop } from "../../utils/loadTimer.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription(`Stop ${Bun.env.NAME}`)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  stopDrop()

  await interaction
    .reply({
      content: `-# > ⏹️ ${Bun.env.NAME} stopped`,
      flags: MessageFlags.Ephemeral
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { create, invoke }
