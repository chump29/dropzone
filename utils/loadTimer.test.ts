import { describe, expect, jest, mock, spyOn, test } from "bun:test"

import { type ChannelManager, type Client, type Message, type ReactionCollector, type TextChannel } from "discord.js"

import { int } from "@nano-faker/core"
import { fake } from "@nano-faker/patterns"

import { type ILoot } from "../db/schema.ts"
import { COUNT, dropLoot, END, loadSettings, RUNNING, startTimer, stopTimer } from "./loadTimer.ts"

describe("loadTimer", (): void => {
  test("loadSettings", async (): Promise<void> => {
    const loot: ILoot[] = [
      {
        max: int(1, 10),
        min: int(1, 10),
        name: fake("*".repeat(10))
      } as ILoot
    ] as ILoot[]

    mock.module("./db.ts", (): unknown => {
      return {
        getLoot: jest.fn().mockResolvedValue(loot),
        updatePoints: jest.fn()
      }
    })

    const channel: TextChannel = {
      send: jest.fn().mockResolvedValue({
        createReactionCollector: jest.fn().mockReturnValue({
          on: jest.fn()
        } as unknown as ReactionCollector),
        react: jest.fn()
      } as unknown as Message)
    } as unknown as TextChannel

    const channelManager: ChannelManager = {
      cache: new Map([
        [
          channel.id,
          channel
        ]
      ]),
      fetch: jest.fn().mockResolvedValue(channel)
    } as unknown as ChannelManager

    const client: Client = {
      channels: channelManager
    } as Client

    await loadSettings(client)

    expect(COUNT).toEqual(1)
  })

  test("loadSettings - no client", async (): Promise<void> => {
    // biome-ignore lint/suspicious/noExplicitAny: for testing
    expect(loadSettings(null as any)).rejects.toThrowError("Invalid client")
  })

  test("dropLoot", async (): Promise<void> => {
    jest.useFakeTimers()
    spyOn(global, "setTimeout")

    await dropLoot()

    // ! TODO: test collector.on()

    expect(setTimeout).toHaveBeenCalled()
  })

  test("startTimer", async (): Promise<void> => {
    jest.useFakeTimers()
    spyOn(global, "setTimeout")

    await startTimer()

    expect(setTimeout).toHaveBeenCalled()

    expect(RUNNING).toBeTrue()
  })

  test("stopTimer", async (): Promise<void> => {
    jest.useFakeTimers()
    spyOn(global, "clearTimeout")

    await stopTimer()

    expect(clearTimeout).toHaveBeenCalled()

    expect(END).toBe(0)

    expect(RUNNING).toBeFalse()
  })
})
