const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnsPath = path.resolve(__dirname, "../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearinfractions")
    .setDescription("Remove todas as infrações de um usuário no servidor.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário para limpar as infrações")
        .setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const guildId = interaction.guild.id;

    // Verifica permissão do moderador
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content:
          "❌ Você precisa da permissão de expulsar membros para usar este comando.",
        ephemeral: true,
      });
    }

    const db = JSON.parse(fs.readFileSync(warnsPath, "utf8"));

    if (!db[guildId] || !db[guildId][user.id]) {
      return interaction.reply({
        content: "❌ Este usuário não possui infrações registradas.",
        ephemeral: true,
      });
    }

    delete db[guildId][user.id];

    fs.writeFileSync(warnsPath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Infrações removidas")
      .setDescription(`Todas as infrações de ${user.tag} foram removidas.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
