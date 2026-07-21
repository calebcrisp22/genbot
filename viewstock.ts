import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('viewstock')
  .setDescription('View the current stock count')
  .addStringOption(opt =>
    opt.setName('category').setDescription('Specific category to view')
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category');
  const db = loadDb();

  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('📦 Stock Overview').setTimestamp();

  if (category) {
    const count = db.stock[category]?.length ?? 0;
    embed.setDescription(`**${category}:** ${count} account(s) in stock`);
  } else {
    const categories = Object.keys(db.stock);
    if (categories.length === 0) {
      embed.setDescription('No stock categories found.');
    } else {
      const lines = categories.map(c => `**${c}:** ${db.stock[c]?.length ?? 0} accounts`);
      embed.setDescription(lines.join('\n'));
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
