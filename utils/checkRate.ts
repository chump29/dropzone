import { type ChatInputCommandInteraction, MessageFlags, type User } from "discord.js";
import { RateLimiter } from "discord.js-rate-limiter";

const rateLimiter = new RateLimiter(1, Number(Bun.env.RATE ?? 1000));

const checkRate = async (interaction: ChatInputCommandInteraction, user: User | null = null): Promise<boolean> => {
  const u = user ?? interaction.user;

  if (u.bot) {
    return true;
  }

  if (rateLimiter.take(u.id)) {
    await interaction.reply({
      content: "-# > Wait a few seconds, then try again.",
      flags: MessageFlags.Ephemeral
    });
    return true;
  }
  return false;
};

export { checkRate };
