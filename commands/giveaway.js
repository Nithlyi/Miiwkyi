const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Inicia um sorteio.")
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Canal onde o sorteio será realizado")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duração")
        .setDescription("Duração do sorteio (ex: 1h, 10m)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("prêmio")
        .setDescription("Prêmio do sorteio")
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("canal");
    const durationStr = interaction.options.getString("duração");
    const prize = interaction.options.getString("prêmio");

    const duration = ms(durationStr);
    if (!duration || duration < 10000) {
      return interaction.reply({
        content: "❌ Duração inválida. Use algo como 10m, 1h, 1d.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎉 Sorteio Iniciado! 🎉")
      .setDescription(
        `**Prêmio:** ${prize}\n**Duração:** ${durationStr}\nReaja com 🎉 para participar!`,
      )
      .setColor("Blue")
      .setTimestamp();

    const giveawayMessage = await channel.send({ embeds: [embed] });
    await giveawayMessage.react("🎉");

    await interaction.reply({
      content: `✅ Sorteio iniciado em ${channel}`,
      ephemeral: true,
    });

    setTimeout(async () => {
      const fetchedMessage = await channel.messages.fetch(giveawayMessage.id);
      const usersReacted = (
        await fetchedMessage.reactions.cache.get("🎉").users.fetch()
      ).filter((u) => !u.bot);
      if (usersReacted.size === 0) {
        return channel.send("❌ Ninguém participou do sorteio.");
      }

      const winner = usersReacted.random();

      const winnerEmbed = new EmbedBuilder()
        .setTitle("🏆 Sorteio Finalizado! 🏆")
        .setDescription(
          `Parabéns ${winner}! Você ganhou o prêmio: **${prize}**`,
        )
        .setColor("Gold")
        .setTimestamp();

      channel.send({
        content: `🎉 Parabéns ${winner}!`,
        embeds: [winnerEmbed],
      });
    }, duration);
  },
};
