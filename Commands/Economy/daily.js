const { SlashCommandBuilder } = require('discord.js');
const Cooldown = require('../../Schemas/CoolDownDaily');
const User = require('../../Schemas/userAccount');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Collect your daily coins bonus.'),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return await interaction.reply(`You don't have an economy account set up.`);
      }

      let cooldown = await Cooldown.findOne({ userId: interaction.user.id });
      if (cooldown && cooldown.cooldownExpiration > Date.now()) {
        const remainingTime = cooldown.cooldownExpiration - Date.now();
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);

        const timeLeftFormatted = `**${hours}** hours, **${minutes}** minutes.`;
        return await interaction.reply(`You already claimed your daily coins.\nPlease wait ${timeLeftFormatted}`);
      }

      user.balance += 500;
      await user.save();

      const newCooldown = {
        userId: interaction.user.id,
        cooldownExpiration: Date.now() + 24 * 60 * 60 * 1000,
      };

      cooldown = await Cooldown.findOneAndUpdate(
        { userId: interaction.user.id },
        newCooldown,
        { upsert: true, new: true }
      );
      await interaction.reply(`You have claimed your daily 🪙 **500** coins.`);
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