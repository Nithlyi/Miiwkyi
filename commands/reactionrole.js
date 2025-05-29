const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Configura uma reaction role numa mensagem existente")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Canal da mensagem")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("mensagemid")
        .setDescription("ID da mensagem onde será adicionada a reaction")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("cargo")
        .setDescription("Cargo que será dado/removido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("Emoji para a reaction (unicode ou emoji custom)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("canal");
    const messageId = interaction.options.getString("mensagemid");
    const role = interaction.options.getRole("cargo");
    const emoji = interaction.options.getString("emoji");
    const guild = interaction.guild;

    if (!channel || channel.guild.id !== guild.id || channel.type !== 0) {
      return interaction.reply({
        content: "Canal inválido ou não é um canal de texto.",
        ephemeral: true,
      });
    }

    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch (err) {
      return interaction.reply({
        content: "Não encontrei a mensagem com esse ID nesse canal.",
        ephemeral: true,
      });
    }

    try {
      await message.react(emoji);
    } catch (err) {
      return interaction.reply({
        content:
          "Não consegui reagir com esse emoji. Use um emoji válido (unicode ou custom).",
        ephemeral: true,
      });
    }

    const filePath = path.join(__dirname, "..", "reactionroles.json");
    let reactionRoles = [];
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        reactionRoles = JSON.parse(data);
      }
    } catch {
      reactionRoles = [];
    }

    // Adiciona nova reaction role
    reactionRoles.push({
      guildId: guild.id,
      channelId: channel.id,
      messageId: message.id,
      emoji,
      roleId: role.id,
    });

    // Salva no arquivo
    try {
      fs.writeFileSync(filePath, JSON.stringify(reactionRoles, null, 2), "utf8");
    } catch (err) {
      return interaction.reply({
        content: "Erro ao salvar as configurações de reaction role.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `✅ Reaction role configurada! Usuários que reagirem com ${emoji} na mensagem <https://discord.com/channels/${guild.id}/${channel.id}/${message.id}> receberão o cargo **${role.name}**.`,
      ephemeral: true,
    });
  },
};
