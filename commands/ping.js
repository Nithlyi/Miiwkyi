const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🏓 Pong!')
      .setDescription('O bot está ativo e respondendo.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
