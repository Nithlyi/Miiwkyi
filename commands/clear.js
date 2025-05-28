const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apaga uma quantidade de mensagens do canal')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Número de mensagens para apagar (1 a 100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const quantidade = interaction.options.getInteger('quantidade');

    if (quantidade < 1 || quantidade > 100) {
      return interaction.reply({
        content: '❌ Você deve escolher um número entre 1 e 100.',
        ephemeral: true
      });
    }

    try {
      const messages = await interaction.channel.bulkDelete(quantidade, true);

      const embed = new EmbedBuilder()
        .setTitle('🧹 Limpeza realizada')
        .setDescription(`Foram apagadas **${messages.size}** mensagens.`)
        .setColor('Blurple')
        .setTimestamp()
        .setFooter({ text: `Comando executado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erro ao limpar mensagens:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao tentar apagar as mensagens.',
        ephemeral: true
      });
    }
  }
};
