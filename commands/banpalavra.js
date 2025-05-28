const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banpalavra')
    .setDescription('Adiciona uma palavra à lista de palavras banidas')
    .addStringOption(opt => opt.setName('palavra').setDescription('Palavra a banir').setRequired(true)),
  async execute(interaction) {
    const palavra = interaction.options.getString('palavra').toLowerCase();
    const path = './config.json';
    const config = JSON.parse(fs.readFileSync(path, 'utf-8'));

    if (!config.bannedWords) config.bannedWords = [];
    if (config.bannedWords.includes(palavra)) {
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`❌ A palavra \`${palavra}\` já está banida.`)], ephemeral: true });
    }

    config.bannedWords.push(palavra);
    fs.writeFileSync(path, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('✅ Palavra Banida')
      .setDescription(`A palavra \`${palavra}\` foi adicionada à lista.`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
