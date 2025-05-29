const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Cria uma mensagem para reaction roles")
    .addRoleOption((opt) =>
      opt.setName("role").setDescription("Cargo a ser dado").setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("emoji")
        .setDescription("Emoji para reagir")
        .setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Canal para enviar a mensagem")
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("mensagem")
        .setDescription("Texto da mensagem que será enviada")
        .setRequired(false),
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const emoji = interaction.options.getString("emoji");
    const channel = interaction.options.getChannel("channel");
    const text =
      interaction.options.getString("mensagem") ||
      `Reaja para receber o cargo ${role.name}`;

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: "❌ O canal precisa ser um canal de texto.",
        ephemeral: true,
      });
    }

    // Envia embed com a mensagem
    const embed = new EmbedBuilder()
      .setTitle("Reaction Role")
      .setDescription(text)
      .setColor("Blue")
      .setFooter({
        text: `Reaja com ${emoji} para receber o cargo ${role.name}`,
      });

    const msg = await channel.send({ embeds: [embed] });
    try {
      await msg.react(emoji);
    } catch {
      return interaction.reply({
        content: "❌ Emoji inválido ou não encontrado para reagir.",
        ephemeral: true,
      });
    }

    // Salva os dados num arquivo reactionroles.json para controle
    const filePath = "./reactionroles.json";
    let data = [];
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    data.push({
      guildId: interaction.guild.id,
      channelId: channel.id,
      messageId: msg.id,
      roleId: role.id,
      emoji: emoji,
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    await interaction.reply({
      content: `✅ Reaction role criada com sucesso em ${channel}`,
      ephemeral: true,
    });
  },
};
