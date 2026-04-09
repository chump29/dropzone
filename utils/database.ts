import { mkdir } from "fs/promises";

import { Database } from "bun:sqlite";

import loadLootData from "./loadLootData";
import loadSettingsData from "./loadSettingsData";
import { error, info } from "./logger";

interface IValue {
  value: string;
}

interface IPoints {
  points: number;
}

interface IChanges {
  changes: number;
}

interface IUser extends IPoints {
  name: string;
}

let DB: Database | null = null;

const openDatabase = async (): Promise<void> => {
  try {
    await mkdir(Bun.env.DB_PATH, {
      recursive: true
    });
    const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`;
    DB = new Database(DB_STR, {
      create: true,
      strict: true
    });
    DB.run("PRAGMA journal_mode = WAL;");
    DB.run("PRAGMA wal_checkpoint(TRUNCATE);");

    try {
      DB.query("SELECT 1 FROM users").run();
    } catch {
      if (Bun.env.DEBUG) {
        info("Creating tables...");
      }

      let table: string = `
      CREATE TABLE users(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        points INTEGER DEFAULT 0
      )`;
      DB.run(table);

      table = `
      CREATE TABLE settings(
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
    )`;
      DB.run(table);

      table = `
      CREATE TABLE loot(
        id INTEGER PRIMARY KEY,
        max INTEGER NOT NULL,
        min INTEGER NOT NULL,
        name TEXT NOT NULL UNIQUE
    )`;
      DB.run(table);

      loadSettingsData();

      await loadLootData();
    }
    if (Bun.env.DEBUG) {
      info(`Using database: ${DB_STR}`);
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const getSetting = async (key: string): Promise<string | null> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    const result: IValue | null = DB.query<
      IValue,
      {
        key: string;
      }
    >("SELECT value FROM settings WHERE key=$key;").get({
      key: key
    });
    if (!result) {
      return null;
    }
    return result.value;
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const updatePoints = (name: string, points: number): void => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    let success: boolean = DB.query<
      boolean,
      {
        name: string;
      }
    >("SELECT 1 FROM users WHERE name=$name;").get({
      name: name
    })
      ? true
      : false;
    if (!success) {
      success = DB.query<
        IChanges,
        {
          name: string;
          points: number;
        }
      >("INSERT INTO users (name, points) VALUES ($name, $points);").run({
        name: name,
        points: points
      }).changes
        ? true
        : false;
      if (!success) {
        throw new Error(`Could not insert user: ${name}`);
      }
    } else {
      const pts: number =
        DB.query<
          IPoints,
          {
            name: string;
          }
        >("SELECT points FROM users WHERE name=$name;").get({
          name: name
        })?.points ?? 0;
      const success: boolean = DB.query<
        IChanges,
        {
          points: number;
          name: string;
        }
      >("UPDATE users SET points = $points WHERE name=$name;").run({
        name: name,
        points: pts + points
      }).changes
        ? true
        : false;
      if (!success) {
        throw new Error(`Could not update user: ${name}`);
      }
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const getAll = async (): Promise<IUser[]> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    return DB.query<IUser, []>("SELECT * FROM users ORDER BY points DESC;").all();
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

export { DB, getAll, getSetting, type IChanges, type IUser, openDatabase, updatePoints };
