import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Colors,
  ModalSubmitInteraction,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('adddropstock')
  .setDescription('Add items to the drop stock')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const modal = new ModalBuilder().setCustomId('adddropstock').setTitle('Add Drop Stock');
  const input = new TextInputBuilder()
    .setCustomId('items')
    .setLabel('Items (one per line)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('account1\naccount2')
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}

export async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  const raw = interaction.fields.getTextInputValue('items');
  const items = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (items.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription('❌ No valid items provided.')],
      ephemeral: true,
    });
    return;
  }
  const db = loadDb();
  db.dropStock.push(...items);
  saveDb(db);
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('🎰 Drop Stock Added')
        .setDescription(`Added **${items.length}** item(s). Total drop stock: **${db.dropStock.length}**.`),
    ],
    ephemeral: true,
  });
}
