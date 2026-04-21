import { mkdir } from "fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import ConvertCsvToJson from "convert-csv-to-json"
import { desc, eq, sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"

import { type ILoot, type IUser, loot, type lootType, users } from "../db/schema.ts"
import { info } from "./logger.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
let LOOT: ILoot[] = []
let LOOT_COUNT: number = 0

const clearLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  await DB.delete(loot)

  if (Bun.env.DEBUG) {
    info("Loot table cleared")
  }
}

const loadLootData = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  await clearLoot()

  const tx = DB.insert(loot)
    .values({
      max: sql.placeholder("max"),
      min: sql.placeholder("min"),
      name: sql.placeholder("name")
    })
    .prepare()

  await ConvertCsvToJson.getJsonFromCsvAsync(`${import.meta.dirname}/loot.csv`).then(
    async (loot: lootType[]): Promise<void> => {
      await Promise.all(
        loot.map(async (item: lootType): Promise<void> => {
          return tx.run(item)
        })
      )
    }
  )

  if (Bun.env.DEBUG) {
    info("Loot items inserted")
  }
}

const loadLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  LOOT = await DB.select().from(loot)
  LOOT_COUNT = await DB.$count(loot)

  if (Bun.env.DEBUG) {
    info(`${LOOT_COUNT} loot items loaded`)
  }
}

const getLoot = (): ILoot => {
  if (!LOOT) {
    throw Error("Loot not loaded")
  }

  return LOOT[Math.floor(Math.random() * LOOT_COUNT)] as ILoot
}

const listLoot = async (): Promise<ILoot[]> => {
  if (!LOOT) {
    throw Error("Loot not found")
  }

  return LOOT.toSorted((a: ILoot, b: ILoot) => a.min - b.min)
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
  DB = drizzle({
    client: SQLITE
  })
  DB.run("PRAGMA journal_mode = WAL;")
  DB.run("PRAGMA wal_checkpoint(TRUNCATE);")

  try {
    await DB.select().from(loot)
    await DB.select().from(users)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables...")
      }

      let table: string = `
      CREATE TABLE users(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        points INTEGER NOT NULL
      )`
      SQLITE.run(table)

      table = `
      CREATE TABLE loot(
        id INTEGER PRIMARY KEY,
        max INTEGER NOT NULL,
        min INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE
    )`
      SQLITE.run(table)

      await loadLootData()
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const updatePoints = async (name: string, points: number): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
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

const getAll = async (): Promise<IUser[]> => {
  if (!DB) {
    throw Error("Database not open")
  }

  return await DB.select().from(users).orderBy(desc(users.points))
}

const resetPoints = async (name: string | null = null): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
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

const close = async (): Promise<void> => {
  SQLITE?.close()
}

export { clearLoot, close, getAll, getLoot, listLoot, loadLoot, loadLootData, openDatabase, resetPoints, updatePoints }
