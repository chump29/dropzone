import { type InferInsertModel, type InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const users = sqliteTable("users", {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  points: integer().notNull()
})

type usersType = InferInsertModel<typeof users>
type IUser = InferSelectModel<typeof users>

const loot = sqliteTable("loot", {
  id: integer().primaryKey(),
  max: integer().notNull(),
  min: integer().notNull(),
  name: text().notNull().unique()
})

type lootType = InferInsertModel<typeof loot>
type ILoot = InferSelectModel<typeof loot>

export { type ILoot, type IUser, loot, type lootType, users, type usersType }
