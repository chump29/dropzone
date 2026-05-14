import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import prettyMilliseconds from "pretty-ms"

import { END, RUNNING } from "../../utils/loadTimer.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show loot drop status")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.reply({
    content: `-# > ⏰ Next loot drop is in \`${
      RUNNING
        ? prettyMilliseconds(END - Date.now(), {
            verbose: true
          })
        : "N/A"
    }\``,
    flags: MessageFlags.Ephemeral
  })
}

export { create, invoke }
