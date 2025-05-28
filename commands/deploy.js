const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { REST, Routes } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const DONO_ID = "1243889655087370270"; // Coloque seu ID aqui para segurança

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deploy")
    .setDescription("Registra/atualiza todos os comandos globalmente")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id !== DONO_ID) {
      return interaction.reply({
        content: "❌ Apenas o dono do bot pode usar este comando.",
        ephemeral: true,
      });
    }

    const commands = [];
    const commandFiles = fs
      .readdirSync("./commands")
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN,
    );

    try {
      await interaction.reply({
        content: "⏳ Registrando comandos globalmente...",
        ephemeral: true,
      });

      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });

      await interaction.editReply({
        content:
          "✅ Comandos registrados globalmente com sucesso!\n⚠️ Pode levar até 1 hora para aparecer nos servidores.",
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "❌ Ocorreu um erro ao registrar os comandos.",
      });
    }
  },
};
