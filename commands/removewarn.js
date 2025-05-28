const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../warns.json");

if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Remove uma infração específica de um usuário.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário que terá a infração removida")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("número")
        .setDescription("Número da infração para remover")
        .setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const numero = interaction.options.getInteger("número");
    const guildId = interaction.guild.id;

    const db = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const warns = db[guildId]?.[user.id];

    if (!warns || warns.length === 0) {
      return interaction.reply({
        content: "❌ Usuário não possui infrações.",
        ephemeral: true,
      });
    }

    if (numero < 1 || numero > warns.length) {
      return interaction.reply({
        content: `❌ Número inválido! Use entre 1 e ${warns.length}.`,
        ephemeral: true,
      });
    }

    // Remove o warn (considerando a lista em ordem cronológica)
    warns.splice(numero - 1, 1);

    // Atualiza DB
    if (warns.length === 0) {
      delete db[guildId][user.id];
    } else {
      db[guildId][user.id] = warns;
    }

    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Infração removida")
      .setDescription(
        `A infração #${numero} de ${user.tag} foi removida com sucesso.`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
