const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('silenciar')
    .setDescription('Silencia ou remove o silêncio de um usuário.')
    .addUserOption(option =>
      option.setName('usuário')
        .setDescription('Usuário que você quer silenciar ou remover o silêncio.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuário');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Você não tem permissão para silenciar membros.', ephemeral: true });
    }

    if (!target) {
      return interaction.reply({ content: '❌ Usuário inválido ou não encontrado.', ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Você não pode se silenciar.', ephemeral: true });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Você não pode silenciar alguém com cargo igual ou superior.', ephemeral: true });
    }

    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'mutado');
    if (!muteRole) {
      return interaction.reply({ content: '❌ Role "Mutado" não encontrada. Crie uma role com esse nome.', ephemeral: true });
    }

    const jáMutado = target.roles.cache.has(muteRole.id);
    const ação = jáMutado ? 'Remover Silêncio' : 'Silenciar';

    const embed = new EmbedBuilder()
      .setTitle(`🔇 ${ação}`)
      .setDescription(`Você quer **${jáMutado ? 'remover o silêncio' : 'silenciar'}** do usuário ${target}?`)
      .setColor(jáMutado ? 'Green' : 'Orange');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirmar_mute_${target.id}_${jáMutado ? 'unsilenciar' : 'silenciar'}`)
        .setLabel(jáMutado ? '✅ Remover Silêncio' : '✅ Silenciar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`cancelar_mute_${target.id}`)
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};
