import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('inviteleaderboard')
  .setDescription('View the top inviters in this server');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const guildId = interaction.guildId!;
  const inviteMap = db.invites[guildId] ?? {};

  const sorted = Object.entries(inviteMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sorted.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription('No invite data recorded yet.')],
      ephemeral: true,
    });
    return;
  }

  const lines = sorted.map(
    ([uid, count], i) => `**${i + 1}.** <@${uid}> — **${count}** invite(s)`
  );

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📨 Invite Leaderboard')
        .setDescription(lines.join('\n')),
    ],
  });
}
