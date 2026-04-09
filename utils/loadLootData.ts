import { type Statement } from "bun:sqlite";

import ConvertCsvToJson from "convert-csv-to-json";

import { DB } from "./database";
import { error, info } from "./logger";
import { type ILoot } from "./loot";

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

    bulkInsert((await ConvertCsvToJson.getJsonFromCsvAsync(`${__dirname}/loot/loot.csv`)) as ILoot[]);

    if (Bun.env.DEBUG) {
      info("Loot items inserted");
    }
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

export { clearLoot, loadLootData };
