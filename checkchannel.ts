import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { loadDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('checkchannel')
  .setDescription('View the current channel configuration')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const cfg = db.channels[interaction.guildId!];

  const gen = cfg?.genChannel ? `<#${cfg.genChannel}>` : '`Not set`';
  const drop = cfg?.dropChannel ? `<#${cfg.dropChannel}>` : '`Not set`';

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📋 Channel Configuration')
        .addFields(
          { name: '🎁 Gen Channel', value: gen, inline: true },
          { name: '🎰 Drop Channel', value: drop, inline: true }
        ),
    ],
    ephemeral: true,
  });
}
