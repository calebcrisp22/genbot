import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb, parseDuration, formatDuration } from '../db.js';
import { startDropLoop, stopDropLoop } from '../dropManager.js';

export const data = new SlashCommandBuilder()
  .setName('dropcooldown')
  .setDescription('Change the interval between automatic drops')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('interval').setDescription('Drop interval e.g. 30m, 1h').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const str = interaction.options.getString('interval', true);
  const ms = parseDuration(str) || 3600000;
  const db = loadDb();
  db.settings.dropIntervalMs = ms;
  saveDb(db);

  if (db.settings.dropActive) {
    stopDropLoop();
    startDropLoop(interaction.client);
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ Drop interval set to **${formatDuration(ms)}**.`),
    ],
    ephemeral: true,
  });
}
