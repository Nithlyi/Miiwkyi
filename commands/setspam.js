const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setspam')
    .setDescription('Configura o limite de mensagens para detectar spam')
    .addIntegerOption(option =>
      option
        .setName('messages')
        .setDescription('Número de mensagens para considerar spam')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    // Verificar permissão do usuário para gerenciar configurações
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Você precisa da permissão Gerenciar Servidor para usar este comando.', ephemeral: true });
    }

    const newLimit = interaction.options.getInteger('messages');

    try {
      const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      config.spamMessageLimit = newLimit;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

      const embed = new EmbedBuilder()
        .setTitle('Configuração Atualizada')
        .setDescription(`O limite de mensagens para detectar spam foi definido para **${newLimit}**.`)
        .setColor('Green');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erro ao atualizar configuração de spam:', error);
      await interaction.reply({ content: '❌ Ocorreu um erro ao atualizar a configuração.', ephemeral: true });
    }
  },
};
