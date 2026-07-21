import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('invites')
  .setDescription('Check your invite count')
  .addUserOption(opt => opt.setName('user').setDescription('User to check (defaults to yourself)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const db = loadDb();
  const count = db.invites[interaction.guildId!]?.[target.id] ?? 0;

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📨 Invite Count')
        .setDescription(`${target} has invited **${count}** member(s) to this server.`),
    ],
    ephemeral: true,
  });
}
