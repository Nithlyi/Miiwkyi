const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antiraid")
    .setDescription("Painel para ativar ou desativar o sistema anti-raid"),

  async execute(interaction) {
    const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    const status = config.antiRaid ? "🟢 Ativado" : "🔴 Desativado";

    const embed = new EmbedBuilder()
      .setTitle("Sistema Anti-Raid")
      .setDescription(
        `Status atual: **${status}**\nClique nos botões abaixo para ativar ou desativar o sistema.`,
      )
      .setColor(config.antiRaid ? "Green" : "Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("antiraid_on")
        .setLabel("Ativar")
        .setStyle(ButtonStyle.Success)
        .setDisabled(config.antiRaid),
      new ButtonBuilder()
        .setCustomId("antiraid_off")
        .setLabel("Desativar")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!config.antiRaid),
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      // 🔧 ephemeral removido
    });
  },
};
