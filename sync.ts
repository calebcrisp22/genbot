import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { syncCommands } from '../commandRegistry.js';

export const data = new SlashCommandBuilder()
  .setName('sync')
  .setDescription('Owner only: Force sync all slash commands');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Only guild owner can run this
  if (interaction.user.id !== interaction.guild?.ownerId) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ Only the server owner can use this command.'),
      ],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await syncCommands(interaction.client.user.id);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('✅ All slash commands have been synced successfully.'),
      ],
    });
  } catch (err) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`❌ Failed to sync commands: \`${String(err)}\``),
      ],
    });
  }
}
