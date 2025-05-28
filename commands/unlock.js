// unlock.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloqueia o canal para todos'),
  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    });

    await interaction.reply({ embeds: [
      new EmbedBuilder().setColor('Green').setDescription('🔓 Canal desbloqueado com sucesso.')
    ]});
  }
};
