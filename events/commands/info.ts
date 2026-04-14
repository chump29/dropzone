import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { checkRate } from "../../utils/checkRate.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(import.meta.file.slice(0, -3))
    .setDescription(`Information about ${Bun.env.NAME}`)
    .toJSON()
}

const embed: EmbedBuilder = new EmbedBuilder()
  .setColor("#78866b")
  .setAuthor({
    iconURL: Bun.env.LOGO_URL,
    name: `${Bun.env.NAME} v${Bun.env.npm_package_version}`
  })
  .setThumbnail(Bun.env.LOGO_URL)
  .setDescription("- Collect military items for cash!")
  .setFooter({
    text: "By Chris Post"
  })

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction
    .reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        embed.toJSON()
      ]
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })
}

export { create, invoke }
