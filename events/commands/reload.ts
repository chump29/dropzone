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

import pluralize from "pluralize"

import { loadLootData } from "../../utils/db.ts"
import { COUNT, refreshLoot } from "../../utils/loadTimer.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reload loot table")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await loadLootData()
    .then(async (): Promise<void> => await refreshLoot())
    .then(
      async (): Promise<InteractionResponse> =>
        await interaction.reply({
          content: "-# > 🔄 Loot table has been reloaded",
          flags: MessageFlags.Ephemeral
        })
    )

  if (Bun.env.DEBUG) {
    info(`Loaded ${pluralize("loot item", COUNT, true)}`)
  }
}

export { create, invoke }
