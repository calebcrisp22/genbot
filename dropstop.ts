import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';
import { stopDropLoop } from '../dropManager.js';

export const data = new SlashCommandBuilder()
  .setName('dropstop')
  .setDescription('Stop the active drop system')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const db = loadDb();
  if (!db.settings.dropActive) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(Colors.Yellow).setDescription('⚠️ No drop is currently running.'),
      ],
      ephemeral: true,
    });
    return;
  }
  stopDropLoop();
  db.settings.dropActive = false;
  saveDb(db);
  await interaction.reply({
    embeds: [
      new EmbedBuilder().setColor(Colors.Green).setDescription('✅ Drop has been stopped.'),
    ],
    ephemeral: true,
  });
}
