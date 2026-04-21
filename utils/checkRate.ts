import { type ChatInputCommandInteraction, MessageFlags, type User } from "discord.js"

import { RateLimiter } from "discord.js-rate-limiter"
import ms, { type StringValue } from "ms"

import { info } from "./logger.ts"

const RATE_LIMIT: number = ms((Bun.env.MAX_TIME || "3h") as StringValue)

const rateLimiter = new RateLimiter(1, RATE_LIMIT)

const checkRate = async (interaction: ChatInputCommandInteraction, user: User | null = null): Promise<boolean> => {
  const u = user ?? interaction.user

  if (u.bot) {
    return true
  }

  if (rateLimiter.take(u.id)) {
    await interaction.reply({
      content: "-# > Wait a few seconds, then try again.",
      flags: MessageFlags.Ephemeral
    })
    return true
  }
  return false
}

if (Bun.env.DEBUG) {
  info(
    `Limiting rate to ${ms(RATE_LIMIT, {
      long: true
    })}`
  )
}

export { checkRate }
