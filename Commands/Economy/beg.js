const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');
const User = require('../../Schemas/userAccount');
const cooldowns = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg For Some Coins :('),
  async execute(interaction, client) {
    const userId = interaction.user.id;

    if(cooldowns[userId] && cooldowns[userId] > Date.now()) {
        const remainingTime = Math.ceil((cooldowns[userId] - Date.now()) / (60 * 1000));
        return interaction.reply({ content: `You're on cooldown 🥶. Please wait **${remainingTime}** minutes.`, ephemeral: true})
    }

    const coins = Math.floor(Math.random() * (500 - 10 + 1)) + 10;

    await User.updateOne({ userId }, { $inc: { balance: coins }});

    cooldowns[userId] = Date.now() + (20 * 60 * 1000); // 20 Minutes Cooldown 

    const embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTitle(`Begging Successful!!!`)
    .setTimestamp()
    .setDescription(`Congrats! You managed to beg your way into recieving **${coins}** coins. Spend them wisely.`)

    interaction.reply({ embeds: [embed]})
  },
};