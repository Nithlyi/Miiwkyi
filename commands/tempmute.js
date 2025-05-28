const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const ms = require("ms"); // Instale com: npm install ms

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempmute")
    .setDescription("Silencia um usuário temporariamente.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário a ser silenciado")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("tempo")
        .setDescription("Duração do mute (ex: 10m, 1h, 1d)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do mute")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Permissão necessária

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const member = interaction.guild.members.cache.get(user.id);
    const tempoStr = interaction.options.getString("tempo");
    const motivo =
      interaction.options.getString("motivo") || "Sem motivo informado";

    if (!member)
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        ephemeral: true,
      });
    if (member.id === interaction.user.id)
      return interaction.reply({
        content: "❌ Você não pode se silenciar.",
        ephemeral: true,
      });
    if (member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return interaction.reply({
        content: "❌ Você não pode silenciar um moderador ou administrador.",
        ephemeral: true,
      });

    const muteRoleName = "Muted";
    let muteRole = interaction.guild.roles.cache.find(
      (r) => r.name === muteRoleName,
    );

    if (!muteRole) {
      try {
        muteRole = await interaction.guild.roles.create({
          name: muteRoleName,
          color: "#514f48",
          permissions: [],
          reason: "Role para mutar usuários temporariamente",
        });

        // Ajustar permissões dos canais para essa role
        for (const [channelId, channel] of interaction.guild.channels.cache) {
          await channel.permissionOverwrites.edit(muteRole, {
            SendMessages: false,
            AddReactions: false,
            Speak: false,
            Connect: false,
          });
        }
      } catch (error) {
        console.error(error);
        return interaction.reply({
          content: "❌ Falha ao criar a role Muted.",
          ephemeral: true,
        });
      }
    }

    if (member.roles.cache.has(muteRole.id)) {
      return interaction.reply({
        content: "❌ Este usuário já está mutado.",
        ephemeral: true,
      });
    }

    // Converter o tempo
    const ms = require("ms");
    const duration = ms(tempoStr);
    if (!duration || duration < 1000) {
      return interaction.reply({
        content: "❌ Tempo inválido. Use formatos como 10m, 1h, 1d.",
        ephemeral: true,
      });
    }

    // Adicionar a role de mute
    await member.roles.add(
      muteRole,
      `Mute temporário por ${tempoStr} - ${motivo}`,
    );

    const embed = new EmbedBuilder()
      .setTitle("🔇 Usuário mutado temporariamente")
      .setColor("Orange")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Usuário", value: `${user.tag} (${user.id})`, inline: true },
        { name: "Moderador", value: interaction.user.tag, inline: true },
        { name: "Duração", value: tempoStr, inline: true },
        { name: "Motivo", value: motivo, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Desmutar após o tempo
    setTimeout(async () => {
      if (member.roles.cache.has(muteRole.id)) {
        await member.roles.remove(muteRole, "Tempo de mute expirado");
      }
    }, duration);
  },
};
