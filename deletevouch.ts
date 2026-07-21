import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('deletevouch')
  .setDescription('Delete a vouch by ID')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('id').setDescription('Vouch ID to delete').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const id = interaction.options.getString('id', true).toUpperCase();
  const db = loadDb();
  const idx = db.vouches.findIndex(v => v.id === id);

  if (idx === -1) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ No vouch found with ID \`${id}\`.`)],
      ephemeral: true,
    });
    return;
  }

  const removed = db.vouches.splice(idx, 1)[0]!;
  saveDb(db);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`✅ Deleted vouch \`${id}\` from **${removed.username}**.`),
    ],
    ephemeral: true,
  });
}
