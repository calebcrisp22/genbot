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
  .setName('addstock')
  .setDescription('Add accounts to stock')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('category').setDescription('Stock category (e.g. Free, Premium)').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category', true);

  const modal = new ModalBuilder()
    .setCustomId(`addstock:${category}`)
    .setTitle(`Add ${category} Stock`);

  const input = new TextInputBuilder()
    .setCustomId('accounts')
    .setLabel('Accounts (one per line)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('email:password\nemail2:password2')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}

export async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  const category = interaction.customId.split(':')[1] ?? 'Free';
  const raw = interaction.fields.getTextInputValue('accounts');
  const accounts = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (accounts.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription('❌ No valid accounts provided.')],
      ephemeral: true,
    });
    return;
  }

  const db = loadDb();
  if (!db.stock[category]) db.stock[category] = [];
  db.stock[category].push(...accounts);
  saveDb(db);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('📦 Stock Added')
        .setDescription(
          `Added **${accounts.length}** account(s) to **${category}** stock.\n**Total:** ${db.stock[category].length}`
        ),
    ],
    ephemeral: true,
  });
}
