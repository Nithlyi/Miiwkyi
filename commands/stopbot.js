const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stopbot")
    .setDescription("Desliga o bot (apenas para o dono)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // opcional

  async execute(interaction) {
    const ownerId = "1243889655087370270"; // substitua pelo seu ID de usuário do Discord

    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ Apenas o dono do bot pode usar este comando.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: "🛑 Bot está sendo desligado...",
      ephemeral: true,
    });

    console.log("⚠️ Bot encerrado manualmente pelo dono.");
    process.exit(0);
  },
};
