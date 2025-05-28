const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Exibe o avatar seu ou de outro usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Selecione um usuário')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setColor(000000)
      .setTitle(`🖼 Avatar de ${user.username}`)
      .setImage(avatarUrl)
      .setFooter({ text: `ID: ${user.id}` })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel('🔽 Baixar avatar')
      .setStyle(ButtonStyle.Link)
      .setURL(avatarUrl);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
