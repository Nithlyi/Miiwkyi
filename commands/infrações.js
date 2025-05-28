const {
  SlashCommandBuilder,
  EmbedBuilder,
  userMention,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../warns.json");

// Garante que o arquivo existe
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infrações")
    .setDescription("Mostra as infrações (warns) de um usuário neste servidor.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário para ver as infrações")
        .setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const guild = interaction.guild;
    const guildId = guild.id;

    const db = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const userWarns = db[guildId]?.[user.id];

    if (!userWarns || userWarns.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`✅ Nenhuma infração`)
            .setDescription(
              `${user.tag} não possui infrações registradas neste servidor.`,
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`⚠️ Infrações de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `Usuário com **${userWarns.length}** infração(ões) registradas neste servidor.`,
      )
      .setFooter({ text: `ID do usuário: ${user.id}` })
      .setTimestamp();

    userWarns
      .slice(-10)
      .reverse()
      .forEach((warn, index) => {
        const date = new Date(warn.timestamp).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        });

        embed.addFields({
          name: `#${userWarns.length - index} • ${date}`,
          value: [
            `📝 **Motivo:** ${warn.motivo}`,
            `👮‍♂️ **Moderador:** ${warn.moderador}`,
          ].join("\n"),
        });
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
