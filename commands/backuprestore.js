// commands/restorebackup.js

const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const backupDir = path.resolve(__dirname, "../backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restorebackup")
    .setDescription(
      "Restaura canais e cargos a partir do último backup deste servidor.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const backupFilePath = path.join(backupDir, `${guildId}.json`);

    if (!fs.existsSync(backupFilePath)) {
      return interaction.reply({
        content: "❌ Nenhum backup encontrado para este servidor.",
        ephemeral: false,
      });
    }

    const confirmBtn = new ButtonBuilder()
      .setCustomId("restore_confirm")
      .setLabel("✅ Confirmar Restauração")
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId("restore_cancel")
      .setLabel("❌ Cancelar")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({
      content:
        "⚠️ Tem certeza que deseja restaurar o backup? Isso pode recriar canais e cargos.",
      components: [row],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
    });

    collector.on("collect", async (btn) => {
      if (btn.user.id !== interaction.user.id)
        return btn.reply({
          content: "❌ Apenas quem executou o comando pode confirmar.",
          ephemeral: true,
        });

      if (btn.customId === "restore_cancel") {
        await btn.update({
          content: "❎ Restauração cancelada.",
          components: [],
        });
        collector.stop();
        return;
      }

      if (btn.customId === "restore_confirm") {
        await btn.update({
          content: "⏳ Restaurando backup...",
          components: [],
        });

        try {
          const guild = interaction.guild;
          const backup = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));

          for (const role of backup.roles) {
            const exists = guild.roles.cache.find((r) => r.name === role.name);
            if (!exists) {
              await guild.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                position: role.position,
                permissions: BigInt(role.permissions),
                mentionable: role.mentionable,
                reason: "Restaurado de backup",
              });
            }
          }

          for (const channel of backup.channels) {
            const exists = guild.channels.cache.find(
              (c) => c.name === channel.name && c.type === channel.type,
            );
            if (!exists) {
              const newChannel = await guild.channels.create({
                name: channel.name,
                type: channel.type,
                parent: channel.parentId,
                position: channel.position,
                reason: "Restaurado de backup",
              });

              for (const perm of channel.permissionOverwrites) {
                await newChannel.permissionOverwrites.create(perm.id, {
                  allow: BigInt(perm.allow),
                  deny: BigInt(perm.deny),
                  type: perm.type,
                });
              }
            }
          }

          await interaction.followUp({
            content: "✅ Backup restaurado com sucesso!",
          });
        } catch (err) {
          console.error(err);
          await interaction.followUp({
            content: "❌ Erro ao restaurar backup.",
          });
        }

        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.editReply({
          content: "⏱️ Tempo expirado. Nenhuma ação foi realizada.",
          components: [],
        });
      }
    });
  },
};
