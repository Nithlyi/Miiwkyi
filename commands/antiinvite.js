const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiinvite')
    .setDescription('Ativa ou desativa o sistema anti-invite com botões interativos'),
  
  async execute(interaction) {
    try {
      const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      const status = config.antiInvite || false;

      const embed = new EmbedBuilder()
        .setTitle('Sistema Anti-Invite')
        .setDescription(`Status atual: **${status ? '🟢 Ativado' : '🔴 Desativado'}**\nClique nos botões abaixo para alterar o status.`)
        .setColor(status ? 'Green' : 'Red');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('antiinvite_on')
            .setLabel('Ativar')
            .setStyle(ButtonStyle.Success)
            .setDisabled(status),
          new ButtonBuilder()
            .setCustomId('antiinvite_off')
            .setLabel('Desativar')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(!status)
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Erro ao carregar configuração.', ephemeral: true });
    }
  }
};
