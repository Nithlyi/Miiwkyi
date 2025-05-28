const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra informações detalhadas de um usuário')
    .addUserOption(option =>
      option.setName('usuário')
        .setDescription('Usuário para ver as informações')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('usuário') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    // Formatar data em formato legível
    const formatDate = date => `<t:${Math.floor(date.getTime() / 1000)}:f>`; // Discord timestamp formato

    // Pegar roles (exclui @everyone)
    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .map(role => role.toString())
      .join(', ') || 'Nenhuma';

    const embed = new EmbedBuilder()
      .setColor('000000')
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setTitle(`Informações de ${user.tag}`)
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Tag', value: user.tag, inline: true },
        { name: 'Bot?', value: user.bot ? 'Sim' : 'Não', inline: true },

        { name: 'Conta criada em', value: formatDate(user.createdAt), inline: false },
        { name: 'Entrou no servidor em', value: member ? formatDate(member.joinedAt) : 'Desconhecido', inline: false },

        { name: `Cargos [${member.roles.cache.size - 1}]`, value: roles, inline: false }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
