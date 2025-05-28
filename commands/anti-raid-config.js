const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anti-raid-config')
    .setDescription('Configura parâmetros do sistema anti-raid')
    .addIntegerOption(option =>
      option.setName('idade_minima')
        .setDescription('Idade mínima da conta em dias para entrar no servidor')
        .setRequired(true)),
  
  async execute(interaction) {
    const idadeMinima = interaction.options.getInteger('idade_minima');
    const configPath = './config.json';

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    config.minAccountAgeDays = idadeMinima;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('Configuração Anti-Raid')
      .setDescription(`A idade mínima da conta foi definida para **${idadeMinima}** dias.`)
      .setColor('Blue');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
