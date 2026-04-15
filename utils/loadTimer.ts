import {
  type Channel,
  type Client,
  type Message,
  type MessageCreateOptions,
  MessageFlags,
  type MessageReaction,
  type ReactionCollector,
  type TextChannel,
  type User
} from "discord.js"

import ms, { type StringValue } from "ms"
import prettyMilliseconds from "pretty-ms"

import { getLoot, getSetting, type ILoot, updatePoints } from "./database.ts"
import { error, info } from "./logger.ts"

let EMOJI: string = ""
let MAX_TIME: number = 0
let MIN_TIME: number = 0
let TIMEOUT: number = 0

let CLIENT: Client | null = null

let ID: NodeJS.Timeout | null = null

const loadSettings = async (): Promise<void> => {
  EMOJI = (await getSetting("emoji")) ?? "💰"
  MAX_TIME = ms(((await getSetting("max")) ?? "3h") as StringValue)
  MIN_TIME = ms(((await getSetting("min")) ?? "1h") as StringValue)
  TIMEOUT = ms(((await getSetting("timeout")) ?? "1m") as StringValue)

  if (Bun.env.DEBUG) {
    info("Settings loaded")
  }
}

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const nextDrop = (timeout: number): void => {
  if (Bun.env.DEBUG) {
    info(`Next drop in ${prettyMilliseconds(timeout)}`)
  }
}

const sendMessage = (): void => {
  if (!CLIENT) {
    throw Error("No client")
  }

  if (MIN_TIME <= TIMEOUT) {
    throw Error("Minimum time is less than the timeout value!")
  }

  CLIENT.channels
    .fetch(Bun.env.CHANNEL_ID)
    .then(async (channel: Channel | null): Promise<void | Message> => {
      if (channel) {
        const options: MessageCreateOptions = {
          content: "✯ 𝕃𝕆𝕆𝕋 𝔻ℝ𝕆ℙ ✯", // cspell: disable-line
          flags: MessageFlags.SuppressNotifications
        }
        // biome-ignore lint/suspicious/noExplicitAny: catch all errors
        const message: void | Message = await (channel as TextChannel).send(options).catch((e: any) => {
          error(e)
          throw e
        })
        if (message) {
          await message.react(EMOJI)

          const filter = (reaction: MessageReaction, user: User): boolean => {
            return reaction.emoji.name === EMOJI && !user.bot
          }

          const collector: ReactionCollector = message.createReactionCollector({
            filter: filter,
            max: 1,
            time: TIMEOUT
          })

          collector.on("collect", async (_: MessageReaction, user: User): Promise<void> => {
            const loot: ILoot = await getLoot()
            const points: number = getRandomNumber(loot.min, loot.max)
            const options: MessageCreateOptions = {
              content: `-# > **Congratulations, \`${user.displayName}\`!  ✨  You found \`${loot.name}\` for \`$${points}\`**`,
              flags: MessageFlags.SuppressNotifications
            }
            await (channel as TextChannel)
              .send(options)
              // biome-ignore lint/suspicious/noExplicitAny: catch all errors
              .catch((e: any) => {
                error(e)
                throw e
              })
            await updatePoints(user.displayName, points)

            if (Bun.env.DEBUG) {
              info(`${user.displayName} claimed ${loot.name} for $${points}`)
            }
          })

          collector.on("end", async (): Promise<void> => {
            if (!collector.collected.size) {
              const options: MessageCreateOptions = {
                content: "-# > Too slow.",
                flags: MessageFlags.SuppressNotifications
              }
              // biome-ignore lint/suspicious/noExplicitAny: catch all errors
              await (channel as TextChannel).send(options).catch((e: any) => {
                error(e)
                throw e
              })
            }
            await message.reactions.removeAll()
          })
        }
      } else {
        throw new Error("Channel not found")
      }
    })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
    .catch((e: any) => {
      error(e)
      throw e
    })

  const t: number = getRandomNumber(MIN_TIME, MAX_TIME)
  stopDrop()
  nextDrop(t)
  ID = setTimeout(sendMessage, t)
}

const startDrop = (): void => {
  const timeout: number = getRandomNumber(MIN_TIME, MAX_TIME)
  nextDrop(timeout)
  ID = setTimeout(sendMessage, timeout)
}

const stopDrop = (): void => {
  if (ID) {
    clearTimeout(ID)
  }
}

const loadTimer = async (client: Client): Promise<void> => {
  CLIENT = client
  await loadSettings()
}

export { loadTimer, startDrop, stopDrop }
