const { SlashCommandBuilder } = require("discord.js");
const User = require("../../Schemas/userAccount");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Gives coins to another user.")
    .addUserOption((option) =>
      option
        .setName("recipient")
        .setDescription("The user to give coins to.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins to give.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    try {
      const sender = interaction.user;
      const recipient = interaction.options.getUser("recipient");
      const amount = interaction.options.getInteger("amount");

      const senderAccount = await User.findOne({ userId: sender.id });
      if (!senderAccount) {
        return await interaction.reply(`You don't have an account yet. Please make a new account using /start.`);
      }

      const recipientAccount = await User.findOne({ userId: recipient.id });
      if (!recipientAccount) {
        return await interaction.reply(`${recipient.username} doesn't have an account yet.`);
      }

      if (senderAccount.balance < amount) {
        return await interaction.reply(`You don't have enough coins to give. :(`);
      }

      senderAccount.balance -= amount;
      recipientAccount.balance += amount;
      await senderAccount.save();
      await recipientAccount.save();

      await interaction.reply(`You have given **${amount}** coins to ${recipient.username}.`);
    } catch (error) {
      console.error("Error:", error);
      await interaction.reply("An error occurred.");
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */