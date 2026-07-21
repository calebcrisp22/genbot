import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('edit')
  .setDescription('Edit a stock entry by index')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('category').setDescription('Stock category').setRequired(true)
  )
  .addIntegerOption(opt =>
    opt.setName('index').setDescription('1-based index of the entry to edit').setRequired(true).setMinValue(1)
  )
  .addStringOption(opt =>
    opt.setName('value').setDescription('New value for the entry').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const category = interaction.options.getString('category', true);
  const index = interaction.options.getInteger('index', true) - 1;
  const value = interaction.options.getString('value', true);

  const db = loadDb();
  const list = db.stock[category];

  if (!list || list.length === 0) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ Category **${category}** is empty.`)],
      ephemeral: true,
    });
    return;
  }

  if (index < 0 || index >= list.length) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`❌ Index out of range. **${category}** has ${list.length} entries.`),
      ],
      ephemeral: true,
    });
    return;
  }

  const old = list[index];
  list[index] = value;
  db.stock[category] = list;
  saveDb(db);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('✏️ Stock Entry Edited')
        .addFields(
          { name: 'Category', value: category, inline: true },
          { name: 'Index', value: `${index + 1}`, inline: true },
          { name: 'Old Value', value: `\`${old}\`` },
          { name: 'New Value', value: `\`${value}\`` }
        ),
    ],
    ephemeral: true,
  });
}
