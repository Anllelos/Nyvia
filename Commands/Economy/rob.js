const { SlashCommandBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Rob another user.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to rob.')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return await interaction.reply(`You don't have an economy account set up.`);
      }

      const target = interaction.options.getUser('user');
      if (target.id === interaction.user.id) {
        return await interaction.reply(`You can't rob yourself.`);
      }

      const targetUser = await User.findOne({ userId: target.id });
      if (!targetUser) {
        return await interaction.reply(`The user you're trying to rob doesn't have an economy account.`);
      }

      if (targetUser.balance < 100) {
        return await interaction.reply(`The user you're trying to rob doesn't have enough coins.`);
      }

      const amountToRob = Math.floor(Math.random() * (targetUser.balance - 100)) + 100;
      targetUser.balance -= amountToRob;
      await targetUser.save();

      user.balance += amountToRob;
      await user.save();

      await interaction.reply(`You robbed ${target.username} of 🪙 ${amountToRob} coins.`);
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply('An error occurred.');
    }
  },
};