const { SlashCommandBuilder } = require("discord.js");
const { Slots } = require("discord-gamecord");
const User = require("../../Schemas/userAccount");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Start the slot game.")
    .addIntegerOption((option) =>
      option
        .setName("coins")
        .setDescription("Enter the amount of coins you want to bet.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const coins = interaction.options.getInteger('coins');
    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply({ content: `You do not have an economy account. Use \`/start\` to make one.`, ephemeral: true})
    }

    if (coins <= 0 || coins > 100000) {
        return interaction.reply({ content: `Please enter a valid coins (1-100000)`, ephemeral: true})
    }

    if (user.balance < coins) {
        return interaction.reply({ content: `Insufficient Balance :( Add more coins to your wallet.`, ephemeral: true})
    }

    const Game = new Slots({
        message: interaction,
        isSlashGame: true,
        embed: {
            title: `Slot Machine`,
            color: client.config.embed
        },
        slots: ['🍇', '🍊', "🍋", "🍌"]
    });

    Game.startGame();
    Game.on('gameOver', async result => {
        if (!result === 'lose') {
            const winnings = coins * 2;
            await User.findOneAndUpdate({ userId }, { $inc: { balance: winnings } });
            interaction.followUp(`Congrats! You won ${winnings} coins.`);
        } else {
            await User.findOneAndUpdate({ userId }, { $inc: { balance: -coins } });
            interaction.followUp(`Better luck next time! :( Your bet amount has been deducted.`);
        }
    });
  },
};
/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */
