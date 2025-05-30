require("./keepalive.js");
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.commands = new Collection();

// Carregar comandos da pasta ./commands
fs.readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  });

// Configurações do bot
let config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
function updateConfig(newConfig) {
  config = newConfig;
  fs.writeFileSync("./config.json", JSON.stringify(newConfig, null, 2));
}

// Reaction Roles
let reactionRoles = [];
const rrPath = "./reactionroles.json";

function loadReactionRoles() {
  if (fs.existsSync(rrPath)) {
    reactionRoles = JSON.parse(fs.readFileSync(rrPath, "utf8"));
    console.log(`📥 Carregados ${reactionRoles.length} reaction roles.`);
  }
}
function saveReactionRoles() {
  fs.writeFileSync(rrPath, JSON.stringify(reactionRoles, null, 2));
  console.log(`💾 Reaction roles salvos.`);
}

loadReactionRoles();

client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

// Proteções - Anti-raid
client.on("guildMemberAdd", async (member) => {
  if (!config.antiRaid || config.manutencao) return;

  const minAgeDays = config.minAccountAgeDays || 5;
  const accountAge = (Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);

  if (accountAge < minAgeDays) {
    const logChannel = member.guild.channels.cache.get(config.logChannelId);
    await member.kick(`Conta muito nova (${accountAge.toFixed(1)} dias) - anti-raid.`).catch(() => {});
    if (logChannel) {
      logChannel.send(
        `🚨 ${member.user.tag} foi kickado (idade: ${accountAge.toFixed(1)} dias).`
      ).catch(() => {});
    }
  }
});

// Proteções - Anti-invite, anti-link, anti-spam
const userMessageCache = new Map();
const spamWarnCooldown = new Set();

client.on("messageCreate", async (message) => {
  if (message.author.bot || config.manutencao) return;

  try {
    const perms = message.member.permissions;
    const content = message.content;

    // Anti-invite
    if (config.antiInvite && /discord(\.gg|app\.com\/invite|\.com\/invite)\//i.test(content)) {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        const aviso = await message.channel.send(`${message.author}, convites não são permitidos.`).catch(() => {});
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      }
    }

    // Anti-link
    if (config.antiLink && /https?:\/\/[^\s]+/gi.test(content)) {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        const aviso = await message.channel.send(`${message.author}, links não são permitidos.`).catch(() => {});
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      }
    }

    // Anti-spam
    if (config.antiSpam) {
      const key = `${message.guild.id}_${message.channel.id}_${message.author.id}`;
      const prev = userMessageCache.get(key) || { content: "", count: 0 };
      prev.count = prev.content === content ? prev.count + 1 : 1;
      prev.content = content;
      userMessageCache.set(key, prev);

      if (prev.count > 4 && !perms.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete().catch(() => {});
        if (!spamWarnCooldown.has(message.author.id)) {
          const aviso = await message.channel.send(`${message.author}, pare de fazer spam.`).catch(() => {});
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

// Reaction Role - adicionar cargo
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error("Erro ao buscar reação:", err);
      return;
    }
  }

  const reactedEmoji = reaction.emoji.id
    ? `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const rr = reactionRoles.find(
    (r) => r.messageId === reaction.message.id && r.emoji === reactedEmoji
  );

  if (!rr) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  const role = guild.roles.cache.get(rr.roleId);
  if (role) {
    await member.roles.add(role).catch(console.error);
  }
});

// Reaction Role - remover cargo
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error("Erro ao buscar reação:", err);
      return;
    }
  }

  const reactedEmoji = reaction.emoji.id
    ? `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const rr = reactionRoles.find(
    (r) => r.messageId === reaction.message.id && r.emoji === reactedEmoji
  );

  if (!rr) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  const role = guild.roles.cache.get(rr.roleId);
  if (role) {
    await member.roles.remove(role).catch(console.error);
  }
});

// Interações com comandos slash
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }
  } catch (error) {
    console.error("Erro na interação:", error);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Erro ao executar o comando.",
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("Erro ao tentar responder erro da interação:", err);
    }
  }
});

console.log("Token carregado:", process.env.TOKEN ? "Sim" : "Não");
client.login(process.env.TOKEN);
