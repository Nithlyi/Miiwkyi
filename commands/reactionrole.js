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
  // Regex simples para emojis Unicode
  const regexUnicode = /\p{Extended_Pictographic}/u;
  // Regex para emoji custom do Discord <a:name:id> ou <:name:id>
  const regexCustom = /^<a?:\w+:\d+>$/;

  return regexUnicode.test(emoji) || regexCustom.test(emoji);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Cria uma mensagem de reaction role.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((opt) =>
      opt
        .setName("mensagem")
        .setDescription("Texto da mensagem")
        .setRequired(true),
    )
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
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("mensagem");
    const role = interaction.options.getRole("cargo");
    const emoji = interaction.options.getString("emoji");

    if (!isValidEmoji(emoji)) {
      return interaction.reply({
        content: "❌ Emoji inválido. Use um emoji padrão ou custom do servidor.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const sentMessage = await interaction.channel.send({ content: msg });

      // Adiciona reação
      try {
        await sentMessage.react(emoji);
      } catch {
        return interaction.editReply({
          content:
            "❌ Falha ao adicionar o emoji. Verifique se o emoji é válido e se o bot tem acesso a ele.",
        });
      }

      reactionRoles.push({
        messageId: sentMessage.id,
        emoji: emoji,
        roleId: role.id,
      });
      saveReactionRoles();

      await interaction.editReply({
        content: "✅ Reaction Role criado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "❌ Erro ao enviar a mensagem de reaction role.",
      });
    }
  },
};
