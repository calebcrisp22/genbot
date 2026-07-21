import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('vouches')
  .setDescription('View recent vouches for the service');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const recent = db.vouches.slice(-10).reverse();

  if (recent.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription('No vouches yet. Be the first with `/vouch`!')],
      ephemeral: true,
    });
    return;
  }

  const lines = recent.map(
    v =>
      `**${v.username}** *(ID: \`${v.id}\`)*\n> ${v.text}`
  );

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('⭐ Recent Vouches')
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: `${db.vouches.length} total vouch(es)` }),
    ],
  });
}
