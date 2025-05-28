const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Exibe o painel de controle do bot"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🛠️ Painel de Controle")
      .setDescription(
        "**Gerencie os sistemas do bot de forma centralizada.**\n\n" +
          "🔒 **Proteções:** Ative ou desative Anti-Raid, Anti-Link, etc.\n" +
          "⚙️ **Configurações:** Defina idade mínima e canal de logs.\n" +
          "🚧 **Manutenção:** Ative modo manutenção, veja status geral.",
      )
      .setFooter({ text: "Selecione uma opção nos menus abaixo." });

    const protecaoMenu = new StringSelectMenuBuilder()
      .setCustomId("menu_protecao")
      .setPlaceholder("🛡️ Sistema de Proteção")
      .addOptions([
        {
          label: "Ativar Anti-Raid",
          value: "antiraid_on",
          emoji: "🟢",
        },
        {
          label: "Desativar Anti-Raid",
          value: "antiraid_off",
          emoji: "🔴",
        },
        {
          label: "Ativar Anti-Invite",
          value: "antiinvite_on",
          emoji: "🟢",
        },
        {
          label: "Desativar Anti-Invite",
          value: "antiinvite_off",
          emoji: "🔴",
        },
        {
          label: "Ativar Anti-Link",
          value: "antilink_on",
          emoji: "🟢",
        },
        {
          label: "Desativar Anti-Link",
          value: "antilink_off",
          emoji: "🔴",
        },
        {
          label: "Ativar Anti-Spam",
          value: "antispam_on",
          emoji: "🟢",
        },
        {
          label: "Desativar Anti-Spam",
          value: "antispam_off",
          emoji: "🔴",
        },
      ]);

    const configMenu = new StringSelectMenuBuilder()
      .setCustomId("menu_config")
      .setPlaceholder("⚙️ Configurações")
      .addOptions([
        {
          label: "Definir Idade Mínima",
          value: "definir_idade",
          emoji: "👤",
        },
        {
          label: "Ver Status Geral",
          value: "mostrar_status",
          emoji: "📋",
        },
      ]);

    const manutencaoMenu = new StringSelectMenuBuilder()
      .setCustomId("menu_manutencao")
      .setPlaceholder("🚧 Modo Manutenção")
      .addOptions([
        {
          label: "Ativar Modo Manutenção",
          value: "manutencao_on",
          emoji: "🚧",
        },
        {
          label: "Desativar Modo Manutenção",
          value: "manutencao_off",
          emoji: "✅",
        },
      ]);

    await interaction.reply({
      ephemeral: false,
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(protecaoMenu),
        new ActionRowBuilder().addComponents(configMenu),
        new ActionRowBuilder().addComponents(manutencaoMenu),
      ],
    });
  },
};
