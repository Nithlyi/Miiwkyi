const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Ativa o modo lento no canal atual')
    .addIntegerOption(opt => opt.setName('segundos').setDescription('Tempo em segundos').setRequired(true)),
  async execute(interaction) {
    const segundos = interaction.options.getInteger('segundos');
    const canal = interaction.channel;

    await canal.setRateLimitPerUser(segundos);

    const embed = new EmbedBuilder()
      .setColor('000000')
      .setTitle('⏱ Modo Lento Ativado')
      .setDescription(`Modo lento definido para \`${segundos}\` segundos.`);

    await interaction.reply({ embeds: [embed] });
  }
};
