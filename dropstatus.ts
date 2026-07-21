import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { loadDb } from '../db.js';
import { isDropRunning, formatDuration } from '../dropManager.js';

export const data = new SlashCommandBuilder()
  .setName('dropstatus')
  .setDescription('Check the current drop system status');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  const active = db.settings.dropActive && isDropRunning();

  const embed = new EmbedBuilder().setTimestamp();

  if (active) {
    const channelId = db.channels[interaction.guildId!]?.dropChannel;
    embed
      .setColor(Colors.Green)
      .setTitle('🎰 Drop Status: Active')
      .addFields(
        { name: '📦 Items Remaining', value: `${db.dropStock.length}`, inline: true },
        { name: '⏱️ Interval', value: formatDuration(db.settings.dropIntervalMs), inline: true },
        { name: '📣 Drop Channel', value: channelId ? `<#${channelId}>` : '*Not set*', inline: true }
      );
  } else {
    embed
      .setColor(Colors.Red)
      .setTitle('🎰 Drop Status: Inactive')
      .setDescription('No drop is currently running. Use `/dropstart` to start one.');
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
