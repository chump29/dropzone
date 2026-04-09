import { type ChatInputCommandInteraction } from "discord.js";

const ONCE: boolean = false;
const NAME: string = "interactionCreate";

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (interaction.isChatInputCommand()) {
    (await import(`${__dirname}/commands/${interaction.commandName}`)).invoke(interaction);
  }
};

export { invoke, NAME, ONCE };
