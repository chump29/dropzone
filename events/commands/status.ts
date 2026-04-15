import { parse } from "path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { checkRate } from "../../utils/checkRate.ts"
import { STATUS } from "../../utils/loadTimer.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription(`${Bun.env.NAME} status`)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction
    .reply({
      content: `-# > ▶️ ${Bun.env.NAME} is ${STATUS ? "started" : "stopped"}`,
      flags: MessageFlags.Ephemeral
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })
}

export { create, invoke }
