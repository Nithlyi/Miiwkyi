require("./keepalive.js");
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  PermissionsBitField,
  REST,
  Routes,
} = require("discord.js");

const clientId = "1376616183276765274";
const guildId = "1361133326328529107";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commands = [];

fs.readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  });

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("📦 Registrando comandos...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("✅ Comandos registrados com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error);
  }
})();

function updateConfig(newConfig) {
  fs.writeFileSync("./config.json", JSON.stringify(newConfig, null, 2));
}

client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

// Proteções
const userMessageCache = new Map();
const spamWarnCooldown = new Set();

client.on("guildMemberAdd", async (member) => {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  if (!config.antiRaid || config.manutencao) return;

  const minAgeDays = config.minAccountAgeDays || 5;
  const accountAge =
    (Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);

  if (accountAge < minAgeDays) {
    const logChannel = member.guild.channels.cache.get(config.logChannelId);
    await member.kick(
      `Conta muito nova (${accountAge.toFixed(1)} dias) - anti-raid.`,
    );
    if (logChannel) {
      logChannel.send(
        `🚨 ${member.user.tag} foi kickado (idade: ${accountAge.toFixed(1)} dias).`,
      );
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  if (config.manutencao) return;

  try {
    const perms = message.member.permissions;
    const content = message.content;

    if (
      config.antiInvite &&
      /discord(\.gg|app\.com\/invite|\.com\/invite)\//i.test(content)
    ) {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        const aviso = await message.channel.send(
          `${message.author}, convites não são permitidos.`,
        );
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      }
    }

    if (config.antiLink && /https?:\/\/[^\s]+/gi.test(content)) {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        const aviso = await message.channel.send(
          `${message.author}, links não são permitidos.`,
        );
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      }
    }

    if (config.antiSpam) {
      const key = `${message.guild.id}_${message.channel.id}_${message.author.id}`;
      const prev = userMessageCache.get(key) || { content: "", count: 0 };

      prev.count = prev.content === content ? prev.count + 1 : 1;
      prev.content = content;
      userMessageCache.set(key, prev);

      if (
        prev.count > 4 &&
        !perms.has(PermissionsBitField.Flags.ManageMessages)
      ) {
        await message.delete().catch(() => {});
        if (!spamWarnCooldown.has(message.author.id)) {
          const aviso = await message.channel.send(
            `${message.author}, pare de fazer spam.`,
          );
          spamWarnCooldown.add(message.author.id);
          setTimeout(() => spamWarnCooldown.delete(message.author.id), 10000);
          setTimeout(() => aviso.delete().catch(() => {}), 5000);
        }
      }
    }
  } catch (err) {
    console.error("Erro nas proteções:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Erro ao executar o comando.",
        ephemeral: true,
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    let response = "";

    switch (interaction.customId) {
      case "menu_protecao":
        switch (interaction.values[0]) {
          case "antiraid_on":
            config.antiRaid = true;
            response = "🟢 Anti-Raid ativado.";
            break;
          case "antiraid_off":
            config.antiRaid = false;
            response = "🔴 Anti-Raid desativado.";
            break;
          case "antiinvite_on":
            config.antiInvite = true;
            response = "🟢 Anti-Invite ativado.";
            break;
          case "antiinvite_off":
            config.antiInvite = false;
            response = "🔴 Anti-Invite desativado.";
            break;
          case "antispam_on":
            config.antiSpam = true;
            response = "🟢 Anti-Spam ativado.";
            break;
          case "antispam_off":
            config.antiSpam = false;
            response = "🔴 Anti-Spam desativado.";
            break;
          case "antilink_on":
            config.antiLink = true;
            response = "🟢 Anti-Link ativado.";
            break;
          case "antilink_off":
            config.antiLink = false;
            response = "🔴 Anti-Link desativado.";
            break;
        }
        break;

      case "menu_config":
        if (interaction.values[0] === "mostrar_status") {
          response =
            `📋 **Status Atual:**\n` +
            `🔐 Anti-Raid: ${config.antiRaid ? "🟢" : "🔴"}\n` +
            `🔗 Anti-Invite: ${config.antiInvite ? "🟢" : "🔴"}\n` +
            `📨 Anti-Spam: ${config.antiSpam ? "🟢" : "🔴"}\n` +
            `🌐 Anti-Link: ${config.antiLink ? "🟢" : "🔴"}\n` +
            `🚧 Manutenção: ${config.manutencao ? "🟠" : "🟢"}\n` +
            `🧓 Idade Mínima Anti-Raid: ${config.minAccountAgeDays || 5} dias`;
        } else if (interaction.values[0] === "definir_idade") {
          return await interaction.showModal({
            customId: "modal_idade_minima",
            title: "Definir Idade Mínima",
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: "idade_minima_input",
                    style: 1,
                    label: "Dias desde a criação da conta",
                    placeholder: "Ex: 5",
                    required: true,
                  },
                ],
              },
            ],
          });
        }
        break;

      case "menu_manutencao":
        config.manutencao = interaction.values[0] === "manutencao_on";
        response = config.manutencao
          ? "🚧 Modo manutenção ativado."
          : "✅ Modo manutenção desativado.";
        break;
    }

    updateConfig(config);
    if (response) {
      await interaction.reply({ content: response, ephemeral: true });
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modal_idade_minima") {
      const input = interaction.fields.getTextInputValue("idade_minima_input");
      const dias = parseInt(input);

      if (isNaN(dias) || dias < 0) {
        return await interaction.reply({
          content: "❌ Valor inválido. Use um número positivo.",
          ephemeral: true,
        });
      }

      config.minAccountAgeDays = dias;
      updateConfig(config);
      await interaction.reply({
        content: `🧓 Idade mínima definida para **${dias} dias**.`,
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
