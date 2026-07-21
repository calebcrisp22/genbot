import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('clearstock')
  .setDescription('Clear all stock from a category')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('category').setDescription('Category to clear (leave blank to clear all)').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category');
  const db = loadDb();

  if (category) {
    const count = db.stock[category]?.length ?? 0;
    db.stock[category] = [];
    saveDb(db);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Cleared **${count}** account(s) from **${category}** stock.`),
      ],
      ephemeral: true,
    });
  } else {
    let total = 0;
    for (const key of Object.keys(db.stock)) {
      total += db.stock[key]?.length ?? 0;
      db.stock[key] = [];
    }
    saveDb(db);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Cleared **${total}** account(s) from all stock categories.`),
      ],
      ephemeral: true,
    });
  }
}
