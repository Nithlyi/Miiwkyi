const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const commands = [];

// ✅ Mude para "false" se quiser registrar apenas em um servidor de teste
const registerGlobally = true;

// 🔁 Função recursiva para ler comandos de subpastas
function carregarComandosDaPasta(pasta) {
  const arquivos = fs.readdirSync(pasta);

  for (const arquivo of arquivos) {
    const caminho = path.join(pasta, arquivo);
    const stats = fs.statSync(caminho);

    if (stats.isDirectory()) {
      carregarComandosDaPasta(caminho); // Recursão para subpastas
    } else if (arquivo.endsWith(".js")) {
      try {
        const command = require(caminho);
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
        } else {
          console.warn(`⚠️ Ignorado: ${arquivo} (faltando "data" ou "execute")`);
        }
      } catch (err) {
        console.error(`❌ Erro ao carregar "${arquivo}":`, err.message);
      }
    }
  }
}

// 🔁 Carrega todos os comandos da pasta ./commands (e subpastas)
carregarComandosDaPasta("./commands");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`⏳ Registrando comandos ${registerGlobally ? "globalmente" : "no servidor de teste"}...`);

    const route = registerGlobally
      ? Routes.applicationCommands(process.env.CLIENT_ID)
      : Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);

    await rest.put(route, { body: commands });

    console.log(`✅ Comandos ${registerGlobally ? "globais" : "do servidor"} registrados com sucesso!`);

    if (registerGlobally) {
      console.log("⚠️ Pode levar até 1 hora para os comandos aparecerem em novos servidores.");
    }

  } catch (error) {
    console.error("❌ Ocorreu um erro ao registrar os comandos:", error);
  }
})();
