import { parse } from "path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  type SlashCommandUserOption,
  type User
} from "discord.js"

import { resetPoints } from "../../utils/database.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reset points")
    .addUserOption(
      (option: SlashCommandUserOption): SlashCommandUserOption => option.setName("user").setDescription("User to reset")
    )
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  let content: string = "Reset all points"

  const user: User | null = interaction.options.getUser("user")
  if (user) {
    await resetPoints(user.displayName)
    content += ` for \`${user.displayName}\``
  } else {
    await resetPoints()
  }

  await interaction
    .reply({
      content: `-# > ↩️ ${content}`,
      flags: MessageFlags.Ephemeral
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info(content)
  }
}

export { create, invoke }
