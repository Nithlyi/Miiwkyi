const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const warnsPath = path.resolve(__dirname, "../warns.json");
const configPath = path.resolve(__dirname, "../config.json");

// Garante que os arquivos existem
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, "{}");
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Adiciona uma infração (warn) a um usuário no servidor.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário que será advertido")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo da infração")
        .setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuário");
    const motivo = interaction.options.getString("motivo");
    const guild = interaction.guild;
    const guildId = guild.id;
    const modTag = interaction.user.tag;

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ Você não pode se warnar.",
        ephemeral: true,
      });
    }

    if (user.bot) {
      return interaction.reply({
        content: "❌ Você não pode warnar um bot.",
        ephemeral: true,
      });
    }

    // Lê os warns e config
    const db = JSON.parse(fs.readFileSync(warnsPath, "utf8"));
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!db[guildId]) db[guildId] = {};
    if (!db[guildId][user.id]) db[guildId][user.id] = [];

    db[guildId][user.id].push({
      motivo,
      moderador: modTag,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(warnsPath, JSON.stringify(db, null, 2));

    // Embed de warn
    const embedWarn = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`⚠️ Usuário advertido`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`${user} foi advertido por:\n**${motivo}**`)
      .addFields(
        { name: "👮‍♂️ Moderador", value: modTag, inline: true },
        {
          name: "🕒 Data",
          value: new Date().toLocaleString("pt-BR"),
          inline: true,
        },
        {
          name: "🔢 Total de warns",
          value: `${db[guildId][user.id].length}`,
          inline: true,
        },
      )
      .setFooter({ text: `ID do usuário: ${user.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embedWarn] });

    // Checa limite de warns para punição automática
    const guildConfig = config[guildId] || {};
    const warnLimit = guildConfig.warnLimit || 3; // padrão 3 warns

    if (db[guildId][user.id].length >= warnLimit) {
      try {
        const member = await guild.members.fetch(user.id);

        if (!member.kickable) {
          return interaction.followUp({
            content: `❌ Não foi possível punir ${user.tag} automaticamente (permissões insuficientes).`,
            ephemeral: true,
          });
        }

        await member.kick(`Atingiu o limite de warns (${warnLimit})`);

        const embedPunicao = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("🚨 Usuário punido automaticamente")
          .setDescription(
            `${user.tag} foi **kickado** por atingir ${warnLimit} infrações.`,
          )
          .setTimestamp();

        await interaction.followUp({ embeds: [embedPunicao], ephemeral: true });
      } catch (error) {
        console.error("Erro ao punir usuário automaticamente:", error);
        await interaction.followUp({
          content:
            "❌ Ocorreu um erro ao tentar punir o usuário automaticamente.",
          ephemeral: true,
        });
      }
    }
  },
};
