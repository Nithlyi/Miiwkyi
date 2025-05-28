// commands/ver-alts.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ver-alts")
    .setDescription("Mostra membros com contas criadas recentemente (potenciais alts)."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const membros = await interaction.guild.members.fetch();
    const agora = Date.now();

    const suspeitos = membros.filter(m =>
      (agora - m.user.createdTimestamp) < 1000 * 60 * 60 * 24 * 7 // menos de 7 dias
    );

    const lista = suspeitos.map(m => `👤 ${m.user.tag} (Criado: <t:${Math.floor(m.user.createdTimestamp / 1000)}:R>)`);

    const embed = new EmbedBuilder()
      .setTitle("🔎 Contas Potencialmente Alternativas")
      .setColor("Orange")
      .setDescription(lista.length ? lista.join("\n") : "Nenhum alt recente encontrado.")
      .setFooter({ text: `Total: ${lista.length}` });

    await interaction.editReply({ embeds: [embed] });
  }
};
