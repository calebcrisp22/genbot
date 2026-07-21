import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, hasActiveSub, formatDuration, formatDurationLong } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('checksub')
  .setDescription('Check a user\'s subscription status')
  .addUserOption(opt => opt.setName('user').setDescription('User to check (defaults to yourself)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const db = loadDb();
  const sub = db.subscriptions[target.id];
  const active = hasActiveSub(db, target.id);

  const embed = new EmbedBuilder().setTimestamp();

  if (!sub || !active) {
    embed
      .setColor(Colors.Red)
      .setTitle('❌ No Active Subscription')
      .setDescription(`${target} does not have an active subscription.`);
  } else {
    const permanent = sub.expiresAt === 0;
    const remaining = permanent ? 0 : sub.expiresAt - Date.now();
    const durationDisplay = permanent ? 'Permanent' : formatDuration(remaining);
    const timeLeftDisplay = permanent ? 'Never expires' : formatDurationLong(remaining);

    embed
      .setColor(0x5865f2)
      .setTitle('💎 Active Subscription')
      .setDescription(`${target} has an active **${sub.type}** subscription.`)
      .addFields(
        { name: '📦 Type', value: sub.type, inline: true },
        { name: '🕰️ Duration Left', value: durationDisplay, inline: true },
        { name: '⏳ Time Left', value: timeLeftDisplay },
        { name: '👤 Granted By', value: sub.grantedBy }
      );
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
