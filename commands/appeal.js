const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const appealsPath = path.resolve(__dirname, "../appeals.json");

// Garante que o arquivo existe
if (!fs.existsSync(appealsPath)) fs.writeFileSync(appealsPath, "[]");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("appeal")
    .setDescription("Envia um pedido de apelação para a moderação.")
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo da apelação")
        .setRequired(true),
    ),

  async execute(interaction) {
    const motivo = interaction.options.getString("motivo");
    const user = interaction.user;

    const appeal = {
      userId: user.id,
      username: user.tag,
      motivo,
      timestamp: new Date().toISOString(),
      guildId: interaction.guild.id,
    };

    // Salva apelação no arquivo
    const appeals = JSON.parse(fs.readFileSync(appealsPath, "utf8"));
    appeals.push(appeal);
    fs.writeFileSync(appealsPath, JSON.stringify(appeals, null, 2));

    // Envia embed pro canal de moderação, que deve estar configurado
    const configPath = path.resolve(__dirname, "../config.json");
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    const logChannelId = config.logChannelId;

    const embed = new EmbedBuilder()
      .setTitle("📢 Nova Apelação Recebida")
      .setColor("Orange")
      .addFields(
        { name: "Usuário", value: `${user.tag} (${user.id})` },
        { name: "Motivo", value: motivo },
        { name: "Servidor", value: interaction.guild.name },
        { name: "Data", value: new Date().toLocaleString("pt-BR") },
      );

    await interaction.reply({
      content: "✅ Sua apelação foi enviada com sucesso!",
      ephemeral: true,
    });

    if (logChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(logChannelId);
        if (channel) {
          channel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error("Erro ao enviar apelação para o canal de logs:", error);
      }
    }
  },
};
