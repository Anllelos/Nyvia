const { SlashCommandBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy-admins')
    .setDescription('Admin commands.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('addbalance')
        .setDescription('Add balance to a user.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to add balance to.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The amount of balance to add.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('removebalance')
        .setDescription('Remove balance from a user.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('The user to remove balance from.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The amount of balance to remove.')
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    try {
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return await interaction.reply(`You don't have permission to use this command.`);
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'addbalance') {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const targetUser = await User.findOne({ userId: user.id });
        if (!targetUser) {
          return await interaction.reply(`The user you're trying to add balance to doesn't have an economy account.`);
        }

        targetUser.balance += amount;
        await targetUser.save();

        await interaction.reply(`You added 🪙 ${amount} coins to ${user.username}'s balance.`);
      } else if (subcommand === 'removebalance') {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const targetUser = await User.findOne({ userId: user.id });
        if (!targetUser) {
          return await interaction.reply(`The user you're trying to remove balance from doesn't have an economy account.`);
        }

        if (targetUser.balance < amount) {
          return await interaction.reply(`The user you're trying to remove balance from doesn't have enough coins.`);
        }

        targetUser.balance -= amount;
        await targetUser.save();

        await interaction.reply(`You removed 🪙 ${amount} coins from ${user.username}'s balance.`);
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