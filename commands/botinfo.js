const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Mostra informações detalhadas sobre o bot."),

  async execute(interaction) {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const memoryUsageMB = (
      process.memoryUsage().heapUsed /
      1024 /
      1024
    ).toFixed(2);
    const cpuModel = os.cpus()[0].model;
    const platform = os.platform();
    const arch = os.arch();

    const embed = new EmbedBuilder()
      .setTitle("Informações do Bot")
      .setColor("#000000")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: "📅 Uptime",
          value: `${days}d ${hours}h ${minutes}m ${seconds}s`,
          inline: true,
        },
        { name: "🖥️ Plataforma", value: `${platform} (${arch})`, inline: true },
        { name: "🧠 CPU", value: cpuModel, inline: false },
        {
          name: "💾 Memória RAM usada",
          value: `${memoryUsageMB} MB`,
          inline: true,
        },
        {
          name: "Servidores",
          value: `${interaction.client.guilds.cache.size}`,
          inline: true,
        },
        { name: "Desenvolvedor", value: "lonelyyi.", inline: true },
        { name: "📚 Biblioteca", value: "discord.js v14", inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID do Bot: ${interaction.client.user.id}` });

    await interaction.reply({ embeds: [embed] });
  },
};
