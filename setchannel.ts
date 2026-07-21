import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  ChannelType,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('setchannel')
  .setDescription('Set a bot channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName('type')
      .setDescription('Channel type')
      .setRequired(true)
      .addChoices(
        { name: 'gen-channel', value: 'genChannel' },
        { name: 'drop-channel', value: 'dropChannel' }
      )
  )
  .addChannelOption(opt =>
    opt
      .setName('channel')
      .setDescription('The channel to set')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const type = interaction.options.getString('type', true) as 'genChannel' | 'dropChannel';
  const channel = interaction.options.getChannel('channel', true);
  const guildId = interaction.guildId!;

  const db = loadDb();
  if (!db.channels[guildId]) db.channels[guildId] = {};
  db.channels[guildId][type] = channel.id;
  saveDb(db);

  const label = type === 'genChannel' ? 'Gen Channel' : 'Drop Channel';

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ **${label}** has been set to ${channel}.`),
    ],
    ephemeral: true,
  });
}
