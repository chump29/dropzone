import { mkdir } from "fs/promises";

import { Database, type Statement } from "bun:sqlite";

import ConvertCsvToJson from "convert-csv-to-json";

import { error, info } from "./logger.ts";

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

interface ILoot {
  max: number;
  min: number;
  name: string;
}

let DB: Database | null = null;

const loadSettingsData = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open");
  }

  const query: Statement = DB.query<
    IChanges,
    {
      key: string;
      value: string;
    }
  >("INSERT INTO settings (key, value) VALUES ($key, $value);");

  let success: boolean = query.run({
    key: "min",
    value: "1h"
  }).changes
    ? true
    : false;
  if (!success) {
    throw new Error("Could not insert value: min");
  }
  success = query.run({
    key: "max",
    value: "3h"
  }).changes
    ? true
    : false;
  if (!success) {
    throw new Error("Could not insert value: max");
  }
  success = query.run({
    key: "timeout",
    value: "1m"
  }).changes
    ? true
    : false;
  if (!success) {
    throw new Error("Could not insert value: timeout");
  }
  success = query.run({
    key: "emoji",
    value: "💰"
  }).changes
    ? true
    : false;
  if (!success) {
    throw new Error("Could not insert value: emoji");
  }

  if (Bun.env.DEBUG) {
    info("Settings inserted");
  }
};

const loadLootData = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    const query: Statement = DB.query<ILoot, []>("INSERT INTO loot (max, min, name) VALUES ($max, $min, $name);");

    const bulkInsert: {
      (loot: ILoot[]): void;
      deferred: (loot: ILoot[]) => void;
      immediate: (loot: ILoot[]) => void;
      exclusive: (loot: ILoot[]) => void;
    } = DB.transaction((loot: ILoot[]) => {
      for (const item of loot) {
        query.run(item);
      }
    });

    bulkInsert((await ConvertCsvToJson.getJsonFromCsvAsync(`${__dirname}/loot.csv`)) as ILoot[]);

    if (Bun.env.DEBUG) {
      info("Loot items inserted");
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

let LOOT: ILoot[] = [];

const loadLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    LOOT = DB.query<ILoot, []>("SELECT * FROM loot;").all();
    if (Bun.env.DEBUG) {
      info(`${LOOT.length} loot items loaded`);
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const getLoot = async (): Promise<ILoot> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    return LOOT[Math.floor(Math.random() * LOOT.length)] as ILoot;
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const clearLoot = async (): Promise<void> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    DB.query("DELETE FROM loot;").run();
    if (Bun.env.DEBUG) {
      info("Loot table cleared");
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

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

      await loadSettingsData();

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

const updatePoints = async (name: string, points: number): Promise<void> => {
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

const resetPoints = async (name: string | null = null): Promise<void> => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    if (name) {
      const success: boolean = DB.query<
        IUser,
        {
          name: string;
        }
      >("UPDATE users SET points = 0 WHERE name = $name;").run({
        name: name
      }).changes
        ? true
        : false;
      if (!success) {
        throw new Error(`Could not reset all points for user: ${name}`);
      }
    } else {
      const success: boolean = DB.query<IUser, []>("UPDATE users SET points = 0;").run().changes ? true : false;
      if (!success) {
        throw new Error("Could not reset all points");
      }
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

const close = (): void => {
  DB?.close();
};

export {
  clearLoot,
  close,
  getAll,
  getLoot,
  getSetting,
  type IChanges,
  type ILoot,
  type IUser,
  loadLoot,
  loadLootData,
  openDatabase,
  resetPoints,
  updatePoints
};
