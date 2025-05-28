const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const configPath = "./config.json";

// Garante config inicial
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwarnlimit")
    .setDescription(
      "Define o número de infrações para aplicar punição automática.",
    )
    .addIntegerOption((option) =>
      option
        .setName("quantidade")
        .setDescription("Quantidade de warns para punição")
        .setRequired(true),
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const quantidade = interaction.options.getInteger("quantidade");

    if (quantidade < 1) {
      return interaction.reply({
        content: "❌ A quantidade deve ser no mínimo 1.",
        ephemeral: true,
      });
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!config[guildId]) config[guildId] = {};

    config[guildId].warnLimit = quantidade;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Limite de warns definido")
      .setDescription(
        `O limite de infrações para punição foi definido como **${quantidade}**.`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
