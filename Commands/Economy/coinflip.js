const { SlashCommandBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and bet on the outcome.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The amount of coins to bet.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('side')
        .setDescription('The side to bet on.')
        .setRequired(true)
        .addChoices(
          { name: 'Heads', value: 'Heads' },
          { name: 'Tails', value: 'Tails' },
        )
    ),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return await interaction.reply(`You don't have an economy account set up.`);
      }

      const amount = interaction.options.getInteger('amount');
      const side = interaction.options.getString('side');

      if (user.balance < amount) {
        return await interaction.reply(`You don't have enough coins to bet.`);
      }

      user.balance -= amount;
      await user.save();

      const message = await interaction.reply(`${interaction.user.tag} spent <:Currency:1289666611317313753> ${amount} coins and chose ${side}\nThe coin spins...`);

      const delay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000; // Random delay between 2-4 seconds
      await new Promise(resolve => setTimeout(resolve, delay));

      const sides = ['Heads', 'Tails'];
      const result = sides[Math.floor(Math.random() * sides.length)];

      if (result === side) {
        user.balance += amount * 2;
        await user.save();
        await message.edit(`${interaction.user.tag} spent <:Currency:1289666611317313753> ${amount} coins and chose ${side}\nThe coin spins... ${result === 'Heads' ? '<a:coinflip:1289666725419421707>' : '<a:coinflip:1289666725419421707>'} and you won it all! 🎉`);
      } else {
        await message.edit(`${interaction.user.tag} spent <:Currency:1289666611317313753> ${amount} coins and chose ${side}\nThe coin spins... ${result === 'Heads' ? '<a:coinflip:1289666725419421707>' : '<a:coinflip:1289666725419421707>'} and you lost it all... :c`);
      }
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