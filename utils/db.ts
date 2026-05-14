import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { info } from "@postfmly/logger"

import ConvertCsvToJson from "convert-csv-to-json"
import { desc, eq, sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import pluralize from "pluralize"

import { type ILoot, type IUser, loot, users } from "../db/schema.ts"

let SQLITE: Database | null = null
let TEST_SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
const TEST_DB: SQLiteBunDatabase | null = null

Bun.env.DB_NAME = Bun.env.DB_NAME || "dropzonebot.db"
Bun.env.DB_PATH = Bun.env.DB_PATH || "./db/"

const loadLootData = async (): Promise<void> => {
  const allLoot: ILoot[] = await ConvertCsvToJson.getJsonFromCsvAsync(`${import.meta.dirname}/loot.csv`)

  if (!allLoot.length) {
    throw new Error("No loot found")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.delete(loot)

  const rows: ILoot[] = await DB.insert(loot).values(allLoot).returning()

  if (Bun.env.DEBUG) {
    info(`Inserted ${pluralize("loot item", rows.length, true)}`)
  }
}

const openDatabase = async (): Promise<void> => {
  await mkdir(Bun.env.DB_PATH, {
    recursive: true
  })

  const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`

  SQLITE = new Database(DB_STR, {
    create: true,
    strict: true
  })

  if (Bun.env.NODE_ENV === "test") {
    TEST_SQLITE = SQLITE
  }

  DB =
    TEST_DB ??
    drizzle({
      client: SQLITE,
      jit: true
    })

  DB.run(
    sql.raw(`
      PRAGMA journal_mode = WAL;
      PRAGMA wal_checkpoint(TRUNCATE);`)
  )

  try {
    await DB.select().from(loot)
    await DB.select().from(users)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables...")
      }

      DB.run(
        sql.raw(`
          CREATE TABLE users(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            points INTEGER NOT NULL);`)
      )

      DB.run(
        sql.raw(`
          CREATE TABLE loot(
            id INTEGER PRIMARY KEY,
            max INTEGER NOT NULL,
            min INTEGER NOT NULL,
            name TEXT NOT NULL UNIQUE);`)
      )

      await loadLootData()
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const getLoot = async (): Promise<ILoot[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(loot)
}

const updatePoints = async (name: string, points: number): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.insert(users)
    .values({
      name: name,
      points: points
    })
    .onConflictDoUpdate({
      target: users.name,
      set: {
        points: points
      }
    })
}

const getUsers = async (): Promise<IUser[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(users).orderBy(desc(users.points))
}

const resetPoints = async (name: string | null = null): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  const tx = DB.update(users).set({
    points: 0
  })
  if (name) {
    tx.where(eq(users.name, name)).run()
  } else {
    tx.run()
  }
}

const closeDatabase = async (): Promise<void> => {
  SQLITE?.close()

  if (Bun.env.DEBUG) {
    info("Database closed")
  }
}

export { closeDatabase, getLoot, getUsers, loadLootData, openDatabase, resetPoints, TEST_DB, TEST_SQLITE, updatePoints }
