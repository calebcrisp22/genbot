import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb, parseDuration, formatDurationLong, formatDuration } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('setsubscription')
  .setDescription('Grant a subscription to a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
  .addStringOption(opt =>
    opt
      .setName('type')
      .setDescription('Subscription type')
      .setRequired(true)
      .addChoices({ name: 'Premium', value: 'Premium' }, { name: 'Free', value: 'Free' })
  )
  .addStringOption(opt =>
    opt
      .setName('duration')
      .setDescription('Duration e.g. 11d, 24h, 30m, 0 for permanent')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('user', true);
  const type = interaction.options.getString('type', true);
  const durationStr = interaction.options.getString('duration', true);

  let durationMs = 0;
  let permanent = false;

  if (durationStr === '0' || durationStr.toLowerCase() === 'perm' || durationStr.toLowerCase() === 'permanent') {
    permanent = true;
    durationMs = 0;
  } else {
    durationMs = parseDuration(durationStr);
    if (durationMs === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription('❌ Invalid duration. Use formats like `11d`, `24h`, `30m`, or `0` for permanent.'),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  const db = loadDb();
  const expiresAt = permanent ? 0 : Date.now() + durationMs;

  db.subscriptions[target.id] = {
    type,
    expiresAt,
    grantedBy: interaction.user.username,
  };
  saveDb(db);

  const durationDisplay = permanent ? 'Permanent' : formatDuration(durationMs);
  const timeLeft = permanent ? 'Never expires' : formatDurationLong(durationMs);

  // DM the user
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`💎 ${type} Subscription Activated!`)
      .setDescription(`You now have **${type}** access to the account generator!`)
      .addFields(
        { name: '🕰️ Duration', value: durationDisplay },
        { name: '⏳ Time Left', value: timeLeft },
        {
          name: '📝 How to use',
          value: `Use \`/generate ${type}\` to get ${type.toLowerCase()} accounts!`,
        }
      )
      .setFooter({ text: `Granted by ${interaction.user.username}` })
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] });
  } catch {
    // DMs disabled
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('✅ Subscription Set')
        .addFields(
          { name: 'User', value: `${target}`, inline: true },
          { name: 'Type', value: type, inline: true },
          { name: 'Duration', value: durationDisplay, inline: true }
        ),
    ],
    ephemeral: true,
  });
}
