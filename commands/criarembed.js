const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criarembed")
    .setDescription("Crie um embed interativo com cor, imagem e pré-visualização."),

  async execute(interaction) {
    let titulo = null;
    let descricao = null;
    let imagem = null;
    let cor = "#00AEFF";

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("titulo")
        .setLabel("📝 Título")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("descricao")
        .setLabel("💬 Descrição")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("imagem")
        .setLabel("🖼️ Imagem")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("cor")
        .setLabel("🎨 Cor")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("preview")
        .setLabel("👁️ Pré-visualizar")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("enviar")
        .setLabel("📤 Enviar")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      content: "Use os botões abaixo para montar seu embed:",
      components: [row, row2],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (btnInt) => {
      if (btnInt.user.id !== interaction.user.id) {
        return btnInt.reply({
          content: "Você não pode usar esse menu.",
          ephemeral: true,
        });
      }

      if (btnInt.customId === "preview") {
        if (!titulo && !descricao && !imagem) {
          return btnInt.reply({
            content: "Adicione ao menos título, descrição ou imagem para visualizar.",
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle(titulo || null)
          .setDescription(descricao || null)
          .setImage(imagem || null)
          .setColor(cor || "#00AEFF")
          .setFooter({ text: `Prévia por ${interaction.user.username}` })
          .setTimestamp();

        return btnInt.reply({
          content: "👁️ Pré-visualização do embed:",
          embeds: [embed],
          ephemeral: true,
        });
      }

      if (btnInt.customId === "enviar") {
        if (!titulo && !descricao && !imagem) {
          return btnInt.reply({
            content: "Preencha pelo menos título, descrição ou imagem antes de enviar.",
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle(titulo)
          .setDescription(descricao)
          .setImage(imagem)
          .setColor(cor)
          .setFooter({ text: `Criado por ${interaction.user.username}` })
          .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        return btnInt.reply({
          content: "✅ Embed enviado com sucesso!",
          ephemeral: true,
        });
      }

      // Abre o modal de entrada
      const modal = new ModalBuilder()
        .setCustomId(`modal_${btnInt.customId}`)
        .setTitle(`Inserir ${btnInt.customId}`);

      const labelMap = {
        titulo: "Digite o título do embed",
        descricao: "Digite a descrição do embed",
        imagem: "Digite a URL da imagem",
        cor: "Digite a cor hexadecimal (ex: #FF0000)",
      };

      const input = new TextInputBuilder()
        .setCustomId("input")
        .setLabel(labelMap[btnInt.customId])
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const modalRow = new ActionRowBuilder().addComponents(input);
      modal.addComponents(modalRow);

      await btnInt.showModal(modal);

      const submitted = await btnInt.awaitModalSubmit({
        time: 60_000,
        filter: (i) => i.user.id === interaction.user.id,
      }).catch(() => null);

      if (!submitted) {
        return btnInt.followUp({ content: "⏱️ Tempo esgotado para responder o modal.", ephemeral: true });
      }

      const valor = submitted.fields.getTextInputValue("input");
      const campo = btnInt.customId;

      if (campo === "titulo") titulo = valor;
      else if (campo === "descricao") descricao = valor;
      else if (campo === "imagem") imagem = valor;
      else if (campo === "cor") {
        const hex = valor.replace("#", "");
        if (!/^([0-9A-Fa-f]{6})$/.test(hex)) {
          return submitted.reply({
            content: "❌ Cor inválida. Use formato hexadecimal, ex: `#FF0000`.",
            ephemeral: true,
          });
        }
        cor = `#${hex.toUpperCase()}`;
      }

      await submitted.reply({
        content: `✅ ${campo.charAt(0).toUpperCase() + campo.slice(1)} atualizado.`,
        ephemeral: true,
      });
    });
  },
};
