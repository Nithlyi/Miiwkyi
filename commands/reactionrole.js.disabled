const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const rrPath = "./reactionroles.json";

let reactionRoles = [];
function loadReactionRoles() {
  if (fs.existsSync(rrPath)) {
    reactionRoles = JSON.parse(fs.readFileSync(rrPath, "utf8"));
  }
}
function saveReactionRoles() {
  fs.writeFileSync(rrPath, JSON.stringify(reactionRoles, null, 2));
}
loadReactionRoles();

function isValidEmoji(emoji) {
  const regexUnicode = /\p{Extended_Pictographic}/u;
  const regexCustom = /^<a?:\w+:\d+>$/;
  return regexUnicode.test(emoji) || regexCustom.test(emoji);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Cria ou configura uma mensagem de reaction role.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    // **Opções obrigatórias primeiro**
    .addRoleOption((opt) =>
      opt
        .setName("cargo")
        .setDescription("Cargo a ser atribuído")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("emoji")
        .setDescription("Emoji para o cargo")
        .setRequired(true),
    )
    // Depois as opções opcionais
    .addStringOption((opt) =>
      opt
        .setName("mensagem")
        .setDescription("Texto da mensagem (deixe vazio se usar mensagem existente)")
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("message_id")
        .setDescription("ID da mensagem existente para configurar")
        .setRequired(false),
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("mensagem");
    const messageId = interaction.options.getString("message_id");
    const role = interaction.options.getRole("cargo");
    const emoji = interaction.options.getString("emoji");

    if (!isValidEmoji(emoji)) {
      return interaction.reply({
        content: "❌ Emoji inválido. Use um emoji padrão ou custom do servidor.",
        ephemeral: true,
      });
    }

    if (!msg && !messageId) {
      return interaction.reply({
        content:
          "❌ Você precisa fornecer uma mensagem para enviar ou o ID de uma mensagem existente para configurar.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let targetMessage;
    try {
      if (messageId) {
        targetMessage = await interaction.channel.messages.fetch(messageId);
        if (!targetMessage) {
          return interaction.editReply({
            content: "❌ Mensagem com esse ID não encontrada neste canal.",
          });
        }
      } else {
        targetMessage = await interaction.channel.send({ content: msg });
      }

      try {
        await targetMessage.react(emoji);
      } catch (err) {
        console.error("Erro ao reagir:", err);
        return interaction.editReply({
          content:
            "❌ Falha ao adicionar o emoji. Verifique se o emoji é válido e se o bot tem permissão para usá-lo.",
        });
      }

      reactionRoles.push({
        messageId: targetMessage.id,
        emoji: emoji,
        roleId: role.id,
      });
      saveReactionRoles();

      return interaction.editReply({
        content: `✅ Reaction Role configurado com sucesso na mensagem ${targetMessage.id}.`,
      });
    } catch (error) {
      console.error("Erro ao configurar reaction role:", error);
      return interaction.editReply({
        content: "❌ Erro ao enviar/configurar a mensagem de reaction role.",
      });
    }
  },
};
