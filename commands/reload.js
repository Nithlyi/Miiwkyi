const { SlashCommandBuilder, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription(
      "♻️ Recarrega todos os comandos do bot globalmente (admin only).",
    ),

  async execute(interaction) {
    const ownerId = "1243889655087370270"; // ← Coloque aqui seu ID
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ Apenas o dono do bot pode usar este comando.",
        ephemeral: true,
      });
    }

    const commands = [];
    const commandsFolder = path.join(__dirname);
    const client = interaction.client;

    client.commands.clear();

    try {
      const commandFiles = fs
        .readdirSync(commandsFolder)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(commandsFolder, file);
        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
        }
      }

      const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

      // Recarrega comandos globais
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });

      await interaction.reply({
        content: "✅ Comandos globais recarregados com sucesso.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Erro ao recarregar comandos globais.",
        ephemeral: true,
      });
    }
  },
};
