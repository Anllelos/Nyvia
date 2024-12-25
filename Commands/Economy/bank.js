const { SlashCommandBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');
const Bank = require('../../Schemas/bankSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Manage your bank account.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('deposit')
        .setDescription('Deposit coins into your bank account.')
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The amount of coins to deposit.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('withdraw')
        .setDescription('Withdraw coins from your bank account.')
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('The amount of coins to withdraw.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('balance')
        .setDescription('Check your bank account balance.')
    ),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return await interaction.reply(`You don't have an economy account set up.`);
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'deposit') {
        const amount = interaction.options.getInteger('amount');
        if (amount > user.balance) {
          return await interaction.reply(`You don't have enough coins to deposit.`);
        }
        user.balance -= amount;
        await user.save();

        const bank = await Bank.findOne({ userID: interaction.user.id });
        if (!bank) {
          const newBank = new Bank({ userID: interaction.user.id, balance: amount });
          await newBank.save();
        } else {
          bank.balance += amount;
          await bank.save();
        }

        await interaction.reply(`You deposited 🪙 ${amount} coins into your bank account.`);
      } else if (subcommand === 'withdraw') {
        const amount = interaction.options.getInteger('amount');
        const bank = await Bank.findOne({ userID: interaction.user.id });
        if (!bank || bank.balance < amount) {
          return await interaction.reply(`You don't have enough coins in your bank account to withdraw.`);
        }
        bank.balance -= amount;
        await bank.save();

        user.balance += amount;
        await user.save();

        await interaction.reply(`You withdrew 🪙 ${amount} coins from your bank account.`);
      } else if (subcommand === 'balance') {
        const bank = await Bank.findOne({ userID: interaction.user.id });
        if (!bank) {
          await interaction.reply(`Your bank account balance is 🪙 0 coins.`);
        } else {
          await interaction.reply(`Your bank account balance is 🪙 ${bank.balance} coins.`);
        }
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