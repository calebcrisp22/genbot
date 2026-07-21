import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb, parseDuration, formatDuration } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('setcooldown')
  .setDescription('Set generate cooldown per category')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName('category')
      .setDescription('Category to set cooldown for')
      .setRequired(true)
      .addChoices({ name: 'Free', value: 'Free' }, { name: 'Premium', value: 'Premium' })
  )
  .addStringOption(opt =>
    opt
      .setName('duration')
      .setDescription('Cooldown duration e.g. 1h, 30m, 0 to disable')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category', true);
  const durationStr = interaction.options.getString('duration', true);

  const ms = durationStr === '0' ? 0 : parseDuration(durationStr);
  const db = loadDb();
  db.cooldownMs[category] = ms;
  saveDb(db);

  const display = ms === 0 ? 'Disabled' : formatDuration(ms);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ **${category}** cooldown set to **${display}**.`),
    ],
    ephemeral: true,
  });
}
