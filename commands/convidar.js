const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// 🔒 IDs dos usuários autorizados
const usuariosAutorizados = ["1243889655087370270", "1332644814344425593"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("convidar")
    .setDescription("Receba um link para convidar o bot (somente usuários autorizados)."),

  async execute(interaction) {
    if (!usuariosAutorizados.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        ephemeral: true,
      });
    }

    const botId = interaction.client.user.id;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot+applications.commands`;

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🤖 Convide o Bot")
      .setDescription("Clique no botão abaixo para adicionar o bot em outro servidor.")
      .setFooter({
        text: "Apenas usuários autorizados podem usar este comando.",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("📩 Me Convide")
        .setURL(inviteUrl)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
