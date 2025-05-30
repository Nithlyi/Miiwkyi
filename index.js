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
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const clientId = "1376616183276765274";
const guildId = "1361133326328529107";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();
const commands = [];

// Carrega comandos da pasta commands
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

// -------- CONFIG --------
// Carrega o config só uma vez na memória
let config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

function updateConfig(newConfig) {
  config = newConfig;
  fs.writeFileSync("./config.json", JSON.stringify(newConfig, null, 2));
}

// -------------------------

client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

// Proteções
const userMessageCache = new Map();
const spamWarnCooldown = new Set();

client.on("guildMemberAdd", async (member) => {
  if (!config.antiRaid || config.manutencao) return;

  const minAgeDays = config.minAccountAgeDays || 5;
  const accountAge = (Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);

  if (accountAge < minAgeDays) {
    const logChannel = member.guild.channels.cache.get(config.logChannelId);
    await member.kick(`Conta muito nova (${accountAge.toFixed(1)} dias) - anti-raid.`);
    if (logChannel) {
      logChannel.send(`🚨 ${member.user.tag} foi kickado (idade: ${accountAge.toFixed(1)} dias).`);
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
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
          `${message.author}, convites não são permitidos.`
        );
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      }
    }

    if (config.antiLink && /https?:\/\/[^\s]+/gi.test(content)) {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        const aviso = await message.channel.send(
          `${message.author}, links não são permitidos.`
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
            `${message.author}, pare de fazer spam.`
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
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Se o comando pode demorar, opcionalmente use deferReply
      // await interaction.deferReply({ ephemeral: true }); // se quiser resposta ephemereal

      await command.execute(interaction);
    }

    else if (interaction.isStringSelectMenu()) {
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
            await interaction.showModal({
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
            return; // não reply depois do showModal
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
        // responder ou editar? Como essa é a primeira resposta ao select menu, usar reply
        await interaction.reply({ content: response, ephemeral: true });
      }
    }

    else if (interaction.isModalSubmit()) {
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

      else if (interaction.customId === "modal_criarembed") {
        const titulo = interaction.fields.getTextInputValue("embed_titulo");
        const descricao = interaction.fields.getTextInputValue("embed_descricao");
        let cor = interaction.fields.getTextInputValue("embed_cor") || "#0099ff";

        if (!cor.startsWith("#")) cor = "#" + cor;

        const embedPreview = new EmbedBuilder()
          .setTitle(titulo)
          .setDescription(descricao)
          .setColor(cor)
          .setFooter({ text: "Confirme ou cancele" });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("embed_confirmar")
            .setLabel("Confirmar")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("embed_cancelar")
            .setLabel("Cancelar")
            .setStyle(ButtonStyle.Danger),
        );

        await interaction.reply({
          embeds: [embedPreview],
          components: [row],
          ephemeral: true,
        });
      }
    }

    else if (interaction.isButton()) {
      if (interaction.customId === "embed_confirmar") {
        const embed = interaction.message.embeds[0];
        if (!embed) {
          return interaction.reply({
            content: "❌ Não achei o embed para enviar.",
            ephemeral: true,
          });
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.update({
          content: "✅ Embed enviado!",
          components: [],
          embeds: [],
        });
      } else if (interaction.customId === "embed_cancelar") {
        await interaction.update({
          content: "❌ Criação de embed cancelada.",
          components: [],
          embeds: [],
        });
      }
    }
  } catch (error) {
    console.error("Erro na interação:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Erro ao executar o comando.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
