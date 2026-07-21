import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

const MESSAGE_KEYS = [
  'generate_free',
  'generate_premium',
  'drop_announce',
  'no_stock',
  'on_cooldown',
] as const;

export const data = new SlashCommandBuilder()
  .setName('messages')
  .setDescription('View or set custom bot messages')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt
      .setName('key')
      .setDescription('Message key to set')
      .addChoices(...MESSAGE_KEYS.map(k => ({ name: k, value: k })))
  )
  .addStringOption(opt =>
    opt.setName('content').setDescription('New message content (leave blank to view all)')
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const key = interaction.options.getString('key');
  const content = interaction.options.getString('content');
  const db = loadDb();

  if (!key) {
    // View all messages
    const lines = MESSAGE_KEYS.map(k => {
      const val = db.settings.messages[k];
      return `**${k}:** ${val ? `\`${val}\`` : '*default*'}`;
    });
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('📝 Custom Messages')
          .setDescription(lines.join('\n')),
      ],
      ephemeral: true,
    });
    return;
  }

  if (!content) {
    const val = db.settings.messages[key];
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(`📝 Message: ${key}`)
          .setDescription(val ? `\`${val}\`` : '*Using default message*'),
      ],
      ephemeral: true,
    });
    return;
  }

  db.settings.messages[key] = content;
  saveDb(db);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ Message **${key}** updated.`),
    ],
    ephemeral: true,
  });
}
