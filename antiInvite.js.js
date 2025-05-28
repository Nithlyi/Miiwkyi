client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  if (!config.antiInvite) return;

  const inviteRegex = /(discord\.gg\/|discordapp\.com\/invite\/|discord\.com\/invite\/)/i;
  if (inviteRegex.test(message.content)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.delete().catch(() => {});
      await message.channel.send({ content: `${message.author}, convites não são permitidos aqui!` });
    }
  }
});
