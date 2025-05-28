const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnsPath = path.resolve(__dirname, "../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnstats")
    .setDescription("Mostra estatísticas detalhadas dos warns no servidor."),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    let db;

    try {
      db = JSON.parse(fs.readFileSync(warnsPath, "utf8"));
    } catch {
      return interaction.reply({
        content: "❌ Erro ao ler o banco de dados de warns.",
        ephemeral: true,
      });
    }

    const guildWarns = db[guildId];
    if (!guildWarns || Object.keys(guildWarns).length === 0) {
      return interaction.reply({
        content: "Nenhuma infração registrada neste servidor.",
        ephemeral: true,
      });
    }

    let totalWarns = 0;
    const warnsPorUsuario = {};
    const warnsPorMod = {};

    for (const userId in guildWarns) {
      if (!Array.isArray(guildWarns[userId])) continue;

      const warns = guildWarns[userId];
      totalWarns += warns.length;
      warnsPorUsuario[userId] = warns.length;

      for (const warn of warns) {
        const mod = warn.moderador || "Desconhecido";
        warnsPorMod[mod] = (warnsPorMod[mod] || 0) + 1;
      }
    }

    if (totalWarns === 0) {
      return interaction.reply({
        content: "Nenhuma infração registrada neste servidor.",
        ephemeral: true,
      });
    }

    // Usuários com mais warns - top 3
    const sortedUsuarios = Object.entries(warnsPorUsuario)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Tenta pegar tags legíveis dos usuários, se não achar mostra o ID
    const topUsuariosDisplay = await Promise.all(
      sortedUsuarios.map(async ([userId, count], index) => {
        try {
          const member = await interaction.guild.members.fetch(userId);
          return `#${index + 1} - ${member.user.tag} (${count} warns)`;
        } catch {
          return `#${index + 1} - ${userId} (${count} warns)`;
        }
      }),
    );

    // Moderador que mais aplicou warns
    const sortedMods = Object.entries(warnsPorMod).sort((a, b) => b[1] - a[1]);
    const modMaisWarns = sortedMods[0];

    const embed = new EmbedBuilder()
      .setTitle("📊 Estatísticas de Warns")
      .setColor(0xffa500)
      .setDescription(
        `Aqui estão as estatísticas detalhadas das infrações neste servidor.\n` +
          `Total de usuários com infrações: **${Object.keys(warnsPorUsuario).length}**\n` +
          `Total de warns aplicados: **${totalWarns}**`,
      )
      .addFields(
        {
          name: "👥 Top 3 usuários com mais warns",
          value: topUsuariosDisplay.join("\n"),
          inline: false,
        },
        {
          name: "🛡️ Moderador que mais aplicou warns",
          value: modMaisWarns
            ? `${modMaisWarns[0]} (${modMaisWarns[1]} warns)`
            : "Nenhum",
          inline: false,
        },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
