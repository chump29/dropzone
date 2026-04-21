import { parse } from "path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import prettyMilliseconds from "pretty-ms"

import { END } from "../../utils/loadTimer.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show loot drop status")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction
    .reply({
      content: `-# > ⏰ Next loot drop is in ${
        END
          ? prettyMilliseconds(END - Date.now(), {
              verbose: true
            })
          : "N/A"
      }`,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown) => {
      error(e)
      throw e
    })
}

export { create, invoke }
