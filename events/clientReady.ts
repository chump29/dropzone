import { readdir } from "fs/promises"

import { type Client, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"

import { info } from "../utils/logger.ts"
import { type ICommandFile } from "./loadCommands.ts"

const invoke = async (client: Client): Promise<void> => {
  if (!client.application || !client.user) {
    throw new Error("Invalid client")
  }

  const commands: string[] = await readdir(`${import.meta.dirname}/commands`).then((dir: string[]) => {
    return dir.filter((file: string) => file.endsWith(".ts"))
  })

  const commandsArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
  await Promise.all(
    commands.map(async (command: string): Promise<void> => {
      const commandFile: ICommandFile = await import(`${import.meta.dirname}/commands/${command}`)
      commandsArray.push(commandFile.create())

      if (Bun.env.DEBUG) {
        info(`Loaded /${command} command`)
      }
    })
  )
  client.application.commands.set(commandsArray)

  if (Bun.env.DEBUG) {
    info(`Connected as ${client.user.displayName} (${client.user.tag})`)
  }
}

export { invoke }
