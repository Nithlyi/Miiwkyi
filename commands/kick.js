const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa um membro do servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário que será expulso')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('motivo')
        .setDescription('Motivo da expulsão')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: '❌ Você não tem permissão para expulsar membros.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Não informado';

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({ content: '❌ Usuário não encontrado no servidor.', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ Não posso expulsar este usuário.', ephemeral: true });
    }

    // Embed de confirmação
    const embed = new EmbedBuilder()
      .setTitle('⚠️ Confirmação de Expulsão')
      .setDescription(`Você tem certeza que deseja expulsar ${user.tag}?\n**Motivo:** ${motivo}`)
      .setColor('Yellow');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirmar_kick_${user.id}`)
        .setLabel('Confirmar')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancelar_kick_${user.id}`)
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
