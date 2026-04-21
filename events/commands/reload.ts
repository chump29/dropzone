import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { clearLoot, loadLoot, loadLootData } from "../../utils/database.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reload loot table")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await clearLoot()
    .then(async (): Promise<void> => await loadLootData())
    .then(async (): Promise<void> => await loadLoot())

  await interaction
    .reply({
      content: "-# > 🔄 Loot table has been reloaded",
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info("Timer started")
  }
}

export { create, invoke }
