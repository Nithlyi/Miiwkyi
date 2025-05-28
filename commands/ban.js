const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um usuário do servidor.')
    .addUserOption(option => option.setName('usuario').setDescription('Usuário para banir').setRequired(true))
    .addStringOption(option => option.setName('motivo').setDescription('Motivo do banimento').setRequired(false)),

  async execute(interaction) {
    // Permissão para banir
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ Você não tem permissão para banir membros.', ephemeral: true });
    }

    const usuario = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo informado';
    const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

    if (!membro) {
      return interaction.reply({ content: 'Usuário não encontrado no servidor.', ephemeral: true });
    }

    if (!membro.bannable) {
      return interaction.reply({ content: '❌ Não posso banir esse usuário.', ephemeral: true });
    }

    // Embed para confirmar ban
    const embed = new EmbedBuilder()
      .setTitle('Confirmação de Banimento')
      .setDescription(`Você quer banir o usuário ${usuario.tag}?\n\n**Motivo:** ${motivo}`)
      .setColor('Red')
      .setThumbnail(usuario.displayAvatarURL())
      .setTimestamp();

    // Botões confirmar e cancelar
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirmar_ban_${usuario.id}_${interaction.user.id}`)
          .setLabel('Confirmar')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`cancelar_ban_${interaction.user.id}`)
          .setLabel('Cancelar')
          .setStyle(ButtonStyle.Secondary),
      );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
