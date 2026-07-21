import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { loadDb, saveDb } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('resetjoins')
  .setDescription('Reset invite/join counts')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt =>
    opt.setName('user').setDescription('User to reset (leave blank to reset all)')
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const target = interaction.options.getUser('user');
  const db = loadDb();
  const guildId = interaction.guildId!;

  if (target) {
    if (db.invites[guildId]) delete db.invites[guildId][target.id];
    if (db.joins[guildId]) delete db.joins[guildId][target.id];
    saveDb(db);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Reset join/invite count for ${target}.`),
      ],
      ephemeral: true,
    });
  } else {
    db.invites[guildId] = {};
    db.joins[guildId] = {};
    saveDb(db);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('✅ Reset all join/invite counts for this server.'),
      ],
      ephemeral: true,
    });
  }
}
