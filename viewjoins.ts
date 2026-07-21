import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('viewjoins')
  .setDescription('View join counts tracked by invite')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const guildId = interaction.guildId!;
  const inviteMap = db.invites[guildId] ?? {};

  const sorted = Object.entries(inviteMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  if (sorted.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription('No join data recorded yet.')],
      ephemeral: true,
    });
    return;
  }

  const lines = sorted.map(([uid, count]) => `<@${uid}>: **${count}** join(s)`);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📊 Join Counts')
        .setDescription(lines.join('\n')),
    ],
    ephemeral: true,
  });
}
