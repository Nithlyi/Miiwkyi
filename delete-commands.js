const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🗑️ Apagando comandos slash do servidor...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }  // Passa um array vazio para apagar todos
    );

    console.log('✅ Todos os comandos foram apagados!');
  } catch (error) {
    console.error('Erro ao apagar comandos:', error);
  }
})();
