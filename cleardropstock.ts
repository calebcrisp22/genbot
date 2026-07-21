import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('cleardropstock')
  .setDescription('Clear all items from the drop stock')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const count = db.dropStock.length;
  db.dropStock = [];
  saveDb(db);
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ Cleared **${count}** item(s) from the drop stock.`),
    ],
    ephemeral: true,
  });
}
