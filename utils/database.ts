import { mkdir } from "fs/promises"

import { Database } from "bun:sqlite"

import ConvertCsvToJson from "convert-csv-to-json"
import { desc, eq, sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"

import { type ILoot, type IUser, loot, type lootType, users } from "../db/schema.ts"
import { error, info } from "./logger.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
let LOOT: ILoot[] = []
let LOOT_COUNT: number = 0

const clearLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  try {
    await DB.delete(loot)

    if (Bun.env.DEBUG) {
      info("Loot table cleared")
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const loadLootData = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  await clearLoot()

  try {
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
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const loadLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  try {
    LOOT = await DB.select().from(loot)
    LOOT_COUNT = await DB.$count(loot)

    if (Bun.env.DEBUG) {
      info(`${LOOT_COUNT} loot items loaded`)
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const getLoot = async (): Promise<ILoot> => {
  if (!LOOT) {
    throw Error("Loot not loaded")
  }

  try {
    const loot: ILoot | undefined = LOOT[Math.floor(Math.random() * LOOT_COUNT)]

    if (!loot) {
      throw new Error("Loot not found")
    }

    return loot
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const listLoot = async (): Promise<ILoot[]> => {
  if (!LOOT) {
    throw Error("Loot not found")
  }

  return LOOT.toSorted((a: ILoot, b: ILoot) => a.min - b.min)
}

const openDatabase = async (): Promise<void> => {
  try {
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
    } catch {
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
    }

    if (Bun.env.DEBUG) {
      info(`Using database: ${DB_STR}`)
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const updatePoints = async (name: string, points: number): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  try {
    await DB.insert(users)
      .values({
        name: name,
        points: points
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          points: points
        }
      })
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const getAll = async (): Promise<IUser[]> => {
  if (!DB) {
    throw Error("Database not open")
  }

  try {
    return await DB.select().from(users).orderBy(desc(users.points))
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const resetPoints = async (name: string | null = null): Promise<void> => {
  if (!DB) {
    throw Error("Database not open")
  }

  try {
    const tx = DB.update(users).set({
      points: 0
    })
    if (name) {
      tx.where(eq(users.name, name)).run()
    } else {
      tx.run()
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e)
    throw e
  }
}

const close = async (): Promise<void> => {
  SQLITE?.close()
}

export { clearLoot, close, getAll, getLoot, listLoot, loadLoot, loadLootData, openDatabase, resetPoints, updatePoints }
