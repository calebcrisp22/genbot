import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('createinvite')
  .setDescription('Create a server invite link');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const invite = await interaction.guild?.invites.create(interaction.channelId, {
      maxAge: 0,
      maxUses: 0,
      reason: `Invite created by ${interaction.user.tag}`,
    });
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('🔗 Invite Created')
          .setDescription(`Here is your invite link:\nhttps://discord.gg/${invite?.code}`),
      ],
      ephemeral: true,
    });
  } catch {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription('❌ Failed to create invite. Make sure the bot has permission to create invites.'),
      ],
      ephemeral: true,
    });
  }
}
