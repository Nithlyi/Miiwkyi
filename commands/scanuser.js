const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scanuser')
    .setDescription('Mostra informações de um usuário do servidor')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('Usuário para escanear')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Verificar permissão do executor
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Você precisa da permissão **Gerenciar Servidor** para usar este comando.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: 'Usuário não encontrado no servidor.', ephemeral: true });
    }

    // Criar embed com as infos
    const embed = new EmbedBuilder()
      .setTitle(`Scan do usuário: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Conta criada em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Entrou no servidor em', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Desconhecido', inline: true },
        { name: 'Cargos', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ') : 'Nenhum', inline: false },
        { name: 'Está silenciado?', value: member.communicationDisabledUntil && member.communicationDisabledUntil > new Date() ? 'Sim' : 'Não', inline: true }
      )
      .setColor('000000')
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
