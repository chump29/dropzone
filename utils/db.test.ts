import { glob, unlink } from "node:fs/promises"

import { type Database } from "bun:sqlite"
import { afterAll, beforeAll, describe, expect, jest, mock, test } from "bun:test"

import { info } from "@postfmly/logger"

import { int } from "@nano-faker/core"
import { fake } from "@nano-faker/patterns"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { EnhancedQueryLogger } from "drizzle-query-logger"

import { type ILoot, type IUser } from "../db/schema.ts"
import { closeDatabase, getLoot, getUsers, openDatabase, resetPoints, TEST_SQLITE, updatePoints } from "./db.ts"

mock.module("./db.ts", (): unknown => {
  return {
    delete: jest.fn(),
    TEST_DB: drizzle({
      client: TEST_SQLITE as Database,
      jit: true,
      logger: Bun.env.DEBUG_SQL === "true" ? new EnhancedQueryLogger() : undefined
    })
  }
})

const deleteFiles = async (): Promise<void> => {
  for await (const file of glob(`${Bun.env.DB_PATH}/${Bun.env.DB_NAME}*`)) {
    info(`Deleting ${file}`)
    await unlink(file)
  }
}

beforeAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => await openDatabase())
})

afterAll(async (): Promise<void> => {
  await deleteFiles().then(async (): Promise<void> => {
    await closeDatabase()
  })
})

const name: string = fake("*".repeat(10))
const min: number = int(1, 10)
// biome-ignore lint/style/noMagicNumbers: min, max
const max: number = int(100, 200)
const loot: ILoot = {
  id: 1,
  max: max,
  min: min,
  name: name
} as ILoot
mock.module("convert-csv-to-json", (): unknown => {
  return {
    default: {
      getJsonFromCsvAsync: jest.fn().mockResolvedValue([
        loot
      ] as ILoot[])
    }
  }
})

describe("db", (): void => {
  test("getLoot", async (): Promise<void> => {
    const allLoot: ILoot[] = await getLoot()
    expect(allLoot).not.toBeEmpty()
    expect(allLoot[0]).toEqual(loot)
  })

  test("getUsers/updatePoints", async (): Promise<void> => {
    const points: number = int(1, 10)
    await updatePoints("test", points)
    const users: IUser[] = await getUsers()
    const user: IUser | undefined = users[0]
    expect(user).not.toBeUndefined()
    expect(user!.name).toBe("test")
    expect(user!.points).toBe(points)
  })

  test("resetPoints - user", async (): Promise<void> => {
    await resetPoints("test")
    const users: IUser[] = await getUsers()
    expect(users[0]!.points).toBe(0)
  })

  test("resetPoints", async (): Promise<void> => {
    await updatePoints("test1", int(1, 10))
    await updatePoints("test2", int(1, 10))
    await resetPoints()
    const users: IUser[] = await getUsers()
    expect(users[1]!.points).toBe(0)
    expect(users[2]!.points).toBe(0)
  })
})
