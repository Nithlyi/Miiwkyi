const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Carrega todos os comandos
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// ✅ Altere isso para true (global) ou false (guild)
const registerGlobally = true;

(async () => {
  try {
    console.log(`⏳ Registrando comandos ${registerGlobally ? 'globalmente' : 'no servidor de teste'}...`);

    const route = registerGlobally
      ? Routes.applicationCommands(process.env.CLIENT_ID)
      : Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);

    await rest.put(route, { body: commands });

    console.log(`✅ Comandos ${registerGlobally ? 'globais' : 'do servidor'} registrados com sucesso!`);

    if (registerGlobally) {
      console.log('⚠️ Pode levar até 1 hora para os comandos aparecerem em novos servidores.');
    }

  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();
