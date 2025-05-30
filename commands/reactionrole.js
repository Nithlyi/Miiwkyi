const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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

    const sentMessage = await interaction.channel.send(msg);
    try {
      await sentMessage.react(emoji);
    } catch (err) {
      return interaction.reply({
        content: "❌ Falha ao adicionar o emoji. Verifique se é válido.",
        ephemeral: true,
      });
    }

    // Atualiza JSON
    const newEntry = {
      messageId: sentMessage.id,
      emoji: emoji,
      roleId: role.id,
    };

    reactionRoles.push(newEntry);
    saveReactionRoles();

    await interaction.reply({
      content: "✅ Reaction Role criado com sucesso.",
      ephemeral: true,
    });
  },
};
