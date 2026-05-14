import {
  type Channel,
  type Client,
  type Message,
  MessageFlags,
  type MessageReaction,
  type ReactionCollector,
  type TextChannel,
  type User
} from "discord.js"

import { info } from "@postfmly/logger"

import ms, { type StringValue } from "ms"
import prettyMilliseconds from "pretty-ms"

import { type ILoot } from "../db/schema.ts"
import { getLoot, updatePoints } from "./db.ts"

let EMOJI: string = ""
let MAX_TIME: number = 0
let MIN_TIME: number = 0
let TIMEOUT: number = 0

let CLIENT: Client | null = null
let CHANNEL: TextChannel | null = null

let LOOT: ILoot[] = []
let COUNT: number = 0

let ID: NodeJS.Timeout | null = null

let RUNNING: boolean = false

let END: number = 0

const getChannel = async (): Promise<TextChannel> => {
  return await CLIENT!.channels.fetch(Bun.env.CHANNEL_ID).then((channel: Channel | null) => {
    if (!channel) {
      throw new Error("Invalid channel")
    }

    return channel as TextChannel
  })
}

const refreshLoot = async (): Promise<void> => {
  LOOT = await getLoot()
  COUNT = LOOT.length
}

const loadSettings = async (client: Client): Promise<void> => {
  if (!client) {
    throw new Error("Invalid client")
  }

  CLIENT = client
  CHANNEL = await getChannel()

  await refreshLoot()

  EMOJI = Bun.env.EMOJI || "💰"

  MAX_TIME = ms((Bun.env.MAX_TIME || "3h") as StringValue)
  MIN_TIME = ms((Bun.env.MIN_TIME || "1h") as StringValue)

  if (MIN_TIME === 0 || MAX_TIME === 0) {
    throw new Error("Invalid min/max time")
  }

  if (MAX_TIME < MIN_TIME) {
    MAX_TIME = MIN_TIME
  }

  TIMEOUT = ms((Bun.env.TIMEOUT || "1m") as StringValue)

  if (TIMEOUT === 0) {
    throw new Error("Invalid timeout")
  }

  if (MIN_TIME < TIMEOUT) {
    MIN_TIME = TIMEOUT
  }

  if (Bun.env.DEBUG) {
    info("Settings loaded")
  }
}

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const dropLoot = async (dropOnly: boolean = false): Promise<void> => {
  if (!CHANNEL) {
    throw new Error("Invalid channel")
  }

  await CHANNEL.send({
    content: "✯ 𝕃𝕆𝕆𝕋 𝔻ℝ𝕆ℙ ✯", // cspell: disable-line
    flags: MessageFlags.SuppressNotifications
  }).then(async (message: Message): Promise<void> => {
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
      const loot: ILoot = LOOT[Math.floor(Math.random() * COUNT)] as ILoot
      const points: number = getRandomNumber(loot.min, loot.max)

      await CHANNEL!.send({
        content: `-# > **Congratulations, \`${user.displayName}\`!  ✨  You found \`${loot.name}\` for \`$${points}\`**`,
        flags: MessageFlags.SuppressNotifications
      })

      await updatePoints(user.displayName, points)

      if (Bun.env.DEBUG) {
        info(`${user.displayName} claimed ${loot.name} for $${points}`)
      }
    })

    collector.on("end", async (): Promise<void> => {
      if (!collector.collected.size) {
        await CHANNEL!.send({
          content: "-# > 🐢 Too slow.",
          flags: MessageFlags.SuppressNotifications
        })
      }

      await message.reactions.removeAll()
    })
  })

  if (!dropOnly) {
    END = 0
    await startTimer()
  }
}

const startTimer = async (): Promise<void> => {
  const timeout: number = getRandomNumber(MIN_TIME, MAX_TIME)
  ID = setTimeout(dropLoot, timeout)
  END = Date.now() + timeout

  RUNNING = true

  if (Bun.env.DEBUG) {
    info(`Next drop in ${prettyMilliseconds(timeout)}`)
  }
}

const stopTimer = async (): Promise<void> => {
  if (ID) {
    clearTimeout(ID)
  }
  END = 0

  RUNNING = false

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { COUNT, dropLoot, END, LOOT, loadSettings, RUNNING, refreshLoot, startTimer, stopTimer }
