import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  TextChannel,
} from 'discord.js';
import { loadDb, saveDb, hasActiveSub, formatDuration } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('generate')
  .setDescription('Generate an account from the stock')
  .addStringOption(opt =>
    opt
      .setName('category')
      .setDescription('Account category')
      .addChoices({ name: 'Free', value: 'Free' }, { name: 'Premium', value: 'Premium' })
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category') ?? 'Free';
  const guildId = interaction.guildId!;
  const userId = interaction.user.id;

  await interaction.deferReply({ ephemeral: true });

  const db = loadDb();

  // Check Premium access
  if (category === 'Premium' && !hasActiveSub(db, userId)) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ You need a **Premium** subscription to generate premium accounts.'),
      ],
    });
    return;
  }

  // Check cooldown
  const cooldownMs = db.cooldownMs[category] ?? 0;
  if (cooldownMs > 0) {
    const lastUsed = db.userCooldowns[userId] ?? 0;
    const elapsed = Date.now() - lastUsed;
    if (elapsed < cooldownMs) {
      const remaining = cooldownMs - elapsed;
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`⏱️ You are on cooldown. Please wait **${formatDuration(remaining)}**.`),
        ],
      });
      return;
    }
  }

  // Check stock
  const stockList = db.stock[category] ?? [];
  if (stockList.length === 0) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`❌ No **${category}** accounts are currently in stock.`),
      ],
    });
    return;
  }

  // Pop account
  const account = stockList.shift()!;
  db.stock[category] = stockList;

  // Set cooldown
  if (cooldownMs > 0) {
    db.userCooldowns[userId] = Date.now();
  }

  saveDb(db);

  // DM the account
  let dmSent = true;
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(category === 'Premium' ? 0x5865f2 : Colors.Green)
      .setTitle(`🎁 Your ${category} Account`)
      .setDescription(`\`\`\`${account}\`\`\``)
      .setFooter({ text: 'Keep this account safe — do not share it.' })
      .setTimestamp();
    await interaction.user.send({ embeds: [dmEmbed] });
  } catch {
    dmSent = false;
  }

  // Post public embed in gen channel
  const genChannelId = db.channels[guildId]?.genChannel;
  const remaining = stockList.length;

  const publicEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('Account Generated')
    .setDescription(`${interaction.user} generated an account!`)
    .setFooter({ text: `Generator • ${remaining} left in stock` })
    .setTimestamp();

  if (db.settings.genImage) {
    publicEmbed.setImage(db.settings.genImage);
  }

  try {
    if (genChannelId) {
      const ch = interaction.guild?.channels.cache.get(genChannelId) as TextChannel | undefined;
      if (ch) await ch.send({ embeds: [publicEmbed] });
    } else {
      await interaction.channel?.send({ embeds: [publicEmbed] });
    }
  } catch {
    // ignore channel send errors
  }

  if (dmSent) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Your **${category}** account has been sent to your DMs!`),
      ],
    });
  } else {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Yellow)
          .setDescription(
            `⚠️ Could not DM you. Please enable DMs from server members.\n\nYour account:\n\`\`\`${account}\`\`\``
          ),
      ],
    });
  }
}
