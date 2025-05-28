const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove o mute de um usuário.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário para remover o mute")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const member = interaction.guild.members.cache.get(user.id);
    if (!member)
      return interaction.reply({
        content: "❌ Usuário não encontrado.",
        ephemeral: true,
      });

    const muteRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Muted",
    );
    if (!muteRole)
      return interaction.reply({
        content: '❌ A role "Muted" não existe.',
        ephemeral: true,
      });

    if (!member.roles.cache.has(muteRole.id)) {
      return interaction.reply({
        content: "❌ Este usuário não está mutado.",
        ephemeral: true,
      });
    }

    try {
      await member.roles.remove(
        muteRole,
        `Unmute solicitado por ${interaction.user.tag}`,
      );

      const embed = new EmbedBuilder()
        .setTitle("🔊 Usuário desmutado")
        .setColor("Green")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "Usuário", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderador", value: interaction.user.tag, inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Não foi possível desmutar o usuário.",
        ephemeral: true,
      });
    }
  },
};
