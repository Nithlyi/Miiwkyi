const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const DONO_ID = "1243889655087370270"; // Seu ID para segurança

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearcommands")
    .setDescription("Apaga todos os comandos globais, exceto o deploy")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id !== DONO_ID) {
      return interaction.reply({
        content: "❌ Apenas o dono pode usar este comando.",
        ephemeral: true,
      });
    }

    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN,
    );

    try {
      await interaction.reply({
        content: "⏳ Buscando comandos globais...",
        ephemeral: true,
      });

      // Busca todos os comandos globais atuais
      const currentCommands = await rest.get(
        Routes.applicationCommands(process.env.CLIENT_ID),
      );

      // Filtra para manter só o comando "deploy"
      const filteredCommands = currentCommands.filter(
        (cmd) => cmd.name === "deploy",
      );

      // Regrava apenas o deploy, apagando os outros
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: filteredCommands,
      });

      await interaction.editReply(
        "✅ Todos os comandos exceto o deploy foram apagados!",
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Erro ao apagar comandos.");
    }
  },
};
