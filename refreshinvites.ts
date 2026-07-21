import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { getInviteCache } from '../inviteCache.js';

export const data = new SlashCommandBuilder()
  .setName('refreshinvites')
  .setDescription('Refresh the invite tracking cache')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });
  try {
    const guild = interaction.guild!;
    const invites = await guild.invites.fetch();
    const cache = getInviteCache();
    cache.set(guild.id, new Map(invites.map(i => [i.code, i.uses ?? 0])));

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Refreshed **${invites.size}** invite(s) in the cache.`),
      ],
    });
  } catch {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ Failed to refresh invites. Check bot permissions.'),
      ],
    });
  }
}
