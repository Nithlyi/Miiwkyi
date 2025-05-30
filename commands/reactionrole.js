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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Cria uma mensagem de reaction role.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((opt) =>
      opt.setName("mensagem").setDescription("Texto da mensagem").setRequired(true)
    )
    .addRoleOption((opt) =>
      opt.setName("cargo").setDescription("Cargo a ser atribuído").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("emoji").setDescription("Emoji para o cargo").setRequired(true)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("mensagem");
    const role = interaction.options.getRole("cargo");
    const emoji = interaction.options.getString("emoji");

    try {
      const sentMessage = await interaction.channel.send({ content: msg });
      try {
        await sentMessage.react(emoji);
      } catch {
        return interaction.reply({
          content: "❌ Falha ao adicionar o emoji. Verifique se é válido.",
          ephemeral: true,
        });
      }

      // Atualiza array global reactionRoles (que é sincronizado com index.js)
      reactionRoles.push({
        messageId: sentMessage.id,
        emoji: emoji,
        roleId: role.id,
      });
      saveReactionRoles();

      await interaction.reply({
        content: "✅ Reaction Role criado com sucesso.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Erro ao enviar a mensagem de reaction role.",
        ephemeral: true,
      });
    }
  },
};
