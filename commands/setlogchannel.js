const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlogchannel")
    .setDescription("Define o canal para logs de moderação.")
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Canal onde os logs serão enviados")
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("canal");

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: "❌ Por favor, escolha um canal de texto válido.",
        ephemeral: true,
      });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    config.logChannelId = channel.id;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Canal de logs definido para ${channel}`,
      ephemeral: true,
    });
  },
};
