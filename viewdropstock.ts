import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('viewdropstock')
  .setDescription('View the current drop stock count');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎰 Drop Stock')
        .setDescription(`There are **${db.dropStock.length}** item(s) in the drop stock.`),
    ],
    ephemeral: true,
  });
}
