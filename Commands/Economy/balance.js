const { SlashCommandBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');
const Bank = require('../../Schemas/bankSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your account balance.'),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return await interaction.reply(`You don't have an economy account set up.`);
      }

      const formattedBalance = user.balance.toLocaleString();

      const bank = await Bank.findOne({ userID: interaction.user.id });
      const formattedBankBalance = bank ? bank.balance.toLocaleString() : '0';

      await interaction.reply(`Your account balance is 🪙 **${formattedBalance}** coins.\nYour 🏦 bank account balance is 🪙 **${formattedBankBalance}** coins.`);
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply('An error occurred.');
    }
  },
};
/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */