const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Mostra o status atual dos sistemas de proteção do bot."),

  async execute(interaction) {
    try {
      const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🛡️ Status dos Sistemas de Proteção")
        .addFields(
          {
            name: "🔐 Anti-Raid",
            value: config.antiRaid ? "🟢 Ativado" : "🔴 Desativado",
            inline: true,
          },
          {
            name: "🔗 Anti-Invite",
            value: config.antiInvite ? "🟢 Ativado" : "🔴 Desativado",
            inline: true,
          },
          {
            name: "📨 Anti-Spam",
            value: config.antiSpam ? "🟢 Ativado" : "🔴 Desativado",
            inline: true,
          },
          {
            name: "📅 Dias mínimos para Anti-Raid",
            value: `${config.minAccountAgeDays || 5} dias`,
            inline: true,
          },
          {
            name: "📋 Canal de Logs",
            value: config.logChannelId
              ? `<#${config.logChannelId}>`
              : "❌ Não definido",
            inline: true,
          },
        )
        .setFooter({ text: "Bot de Proteção • Status Atual" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error("Erro ao carregar status:", err);
      await interaction.reply({
        content: "❌ Ocorreu um erro ao obter o status.",
        ephemeral: true,
      });
    }
  },
};
