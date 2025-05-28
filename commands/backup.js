// commands/backup.js

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
    .setName("backup")
    .setDescription("Faz backup dos canais e cargos do servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const backupFilePath = path.join(backupDir, `${guildId}.json`);

    const confirmBtn = new ButtonBuilder()
      .setCustomId("backup_confirm")
      .setLabel("✅ Confirmar Backup")
      .setStyle(ButtonStyle.Primary);

    const cancelBtn = new ButtonBuilder()
      .setCustomId("backup_cancel")
      .setLabel("❌ Cancelar")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    await interaction.reply({
      content:
        "⚠️ Deseja realmente fazer backup deste servidor? Isso salvará canais e cargos atuais.",
      components: [row],
      ephemeral: false,
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

      if (btn.customId === "backup_cancel") {
        await btn.update({ content: "❎ Backup cancelado.", components: [] });
        collector.stop();
        return;
      }

      if (btn.customId === "backup_confirm") {
        await btn.update({
          content: "⏳ Realizando backup...",
          components: [],
        });

        try {
          const channelsData = interaction.guild.channels.cache.map(
            (channel) => ({
              name: channel.name,
              type: channel.type,
              parentId: channel.parentId,
              position: channel.position,
              permissionOverwrites: channel.permissionOverwrites.cache.map(
                (po) => ({
                  id: po.id,
                  type: po.type,
                  allow: po.allow.toString(),
                  deny: po.deny.toString(),
                }),
              ),
            }),
          );

          const rolesData = interaction.guild.roles.cache
            .filter((role) => role.name !== "@everyone")
            .map((role) => ({
              name: role.name,
              color: role.color,
              hoist: role.hoist,
              position: role.position,
              permissions: role.permissions.toString(),
              mentionable: role.mentionable,
            }));

          const backupData = {
            guildId,
            name: interaction.guild.name,
            channels: channelsData,
            roles: rolesData,
            timestamp: new Date().toISOString(),
          };

          fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
          await interaction.followUp({
            content: "✅ Backup salvo com sucesso!",
          });
        } catch (err) {
          console.error(err);
          await interaction.followUp({
            content: "❌ Erro ao salvar o backup.",
          });
        }

        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.editReply({
          content: "⏱️ Tempo expirado. Backup não realizado.",
          components: [],
        });
      }
    });
  },
};
