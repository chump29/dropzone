import { type Statement } from "bun:sqlite";

import { DB, type IChanges } from "./database";
import { info } from "./logger";

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

export default loadSettingsData;
