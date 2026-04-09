import { DB } from "./database";
import { error, info } from "./logger";

interface ILoot {
  max: number;
  min: number;
  name: string;
}

const getLoot = (): ILoot => {
  if (!DB) {
    throw Error("Database not open");
  }

  try {
    const loot: ILoot[] = DB.query<ILoot, []>("SELECT * FROM loot;").all();
    if (Bun.env.DEBUG) {
      info(`${loot.length} loot items loaded`);
    }
    return loot[Math.floor(Math.random() * loot.length)] as ILoot;
    // biome-ignore lint/suspicious/noExplicitAny: catch all errors
  } catch (e: any) {
    error(e);
    throw e;
  }
};

export { getLoot, type ILoot };
