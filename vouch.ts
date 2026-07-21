import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb, generateId } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('vouch')
  .setDescription('Submit a vouch for the service')
  .addStringOption(opt =>
    opt
      .setName('text')
      .setDescription('Your vouch message')
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(500)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const text = interaction.options.getString('text', true).trim();
  const db = loadDb();

  const vouch = {
    id: generateId(),
    userId: interaction.user.id,
    username: interaction.user.username,
    text,
    timestamp: Date.now(),
    guildId: interaction.guildId ?? 'dm',
  };

  db.vouches.push(vouch);
  saveDb(db);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('⭐ Vouch Submitted!')
        .setDescription(text)
        .setFooter({ text: `ID: ${vouch.id} • ${interaction.user.username}` })
        .setTimestamp(),
    ],
  });
}
