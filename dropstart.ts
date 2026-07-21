import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb, parseDuration, formatDuration } from '../db.js';
import { startDropLoop } from '../dropManager.js';

export const data = new SlashCommandBuilder()
  .setName('dropstart')
  .setDescription('Start the drop system')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName('interval')
      .setDescription('How often to drop an item e.g. 1h, 30m (default: 1h)')
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const intervalStr = interaction.options.getString('interval') ?? '1h';
  const intervalMs = parseDuration(intervalStr) || 3600000;

  const db = loadDb();

  if (db.dropStock.length === 0) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ Drop stock is empty. Add items with `/adddropstock` first.'),
      ],
      ephemeral: true,
    });
    return;
  }

  const channelId = db.channels[interaction.guildId!]?.dropChannel;
  if (!channelId) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ No drop channel set. Use `/setchannel drop-channel #channel` first.'),
      ],
      ephemeral: true,
    });
    return;
  }

  db.settings.dropActive = true;
  db.settings.dropIntervalMs = intervalMs;
  saveDb(db);

  startDropLoop(interaction.client);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('🎰 Drop Started!')
        .setDescription(
          `Dropping items every **${formatDuration(intervalMs)}**.\n` +
          `**${db.dropStock.length}** items in drop stock.\n` +
          `Dropping in <#${channelId}>.`
        ),
    ],
    ephemeral: true,
  });
}
