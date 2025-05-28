// lockdown.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Impede que membros enviem mensagens no canal atual'),
  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    await interaction.reply({ embeds: [
      new EmbedBuilder().setColor('Red').setDescription('🔒 Canal bloqueado com sucesso.')
    ]});
  }
};
