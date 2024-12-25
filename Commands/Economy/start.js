const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require('discord.js');
  
  const User = require('../../Schemas/userAccount');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('start')
      .setDescription('Create a economy user account'),
    async execute(interaction, client) {
      try {
        const existingUser = await User.findOne({ userId: interaction.user.id });
  
        if (existingUser) {
          await interaction.reply('You already have an account.');
        }
  
        const termsEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Terms and Services')
          .setDescription(`
            Rule 1: No using self-bots, macros or scripts to spam game commands or exploit other commands.
            Rule 1.1: Violation can result in any of the following:
            A Shack Reset
            A Bot Blacklist
            Bans in all TacoShack servers
            Rule 2: No using inappropriate shack names or franchise names
            Rule 2.1: This includes offensive names and bad words
            Rule 3: No multi-accounting.
            Rule 3.1: You can still have more than one shack, but you can not use this to gain an advantage
            Rule 3.2: This includes using them to gain an advantage by donating and leveling a franchise
            Rule 3.3: Similarly, franchise boosting is not allowed.
            Rule 4: No account sharing (multiple people using the same account)
            Rule 5: Do not abuse bugs or exploits within the bot.
            Rule 5.1: Failing to report bugs or exploits and using them instead will result in a data reset!
          `)
          .setTimestamp();
  
        const acceptButton = new ButtonBuilder()
          .setCustomId('accept_terms')
          .setLabel('Accept')
          .setEmoji(`<:etick:1238390219300933685>`)
          .setStyle(ButtonStyle.Success);
  
        const row = new ActionRowBuilder().addComponents(acceptButton);
        const termsMessage = await interaction.reply({
          embeds: [termsEmbed],
          components: [row],
        });
  
        const filter = (i) => i.customId === 'accept_terms' && i.user.id === interaction.user.id;
  
        const collector = termsMessage.createMessageComponentCollector({
          filter,
          time: 10000,
        });
  
        collector.on('collect', async (interaction) => {
          if (interaction.user.id !== interaction.user.id) {
            await interaction.reply('This is not your message.');
            return;
          }
          await interaction.update({
            embeds: [termsEmbed],
            components: [],
          });
  
          const newUser = new User({
            userId: interaction.user.id,
            userName: interaction.user.username,
            balance: 1000,
          });
  
          await newUser.save();
  
          const successMessage = `<:gw:1271441963249434707> Your Account has been created with **1000** coins.`
  
          await interaction.editReply({ content: successMessage, embeds: [] });
          collector.stop();
        });
  
        collector.on('end', (collected) => {
          if (collected.size === 0) {
            interaction.editReply({
              embeds: [termsEmbed],
              components: []
            });
            interaction.followUp('You did not accept the terms within the given time.');
          }
        });
      } catch (error) {
        console.error('Error: ', error);
        await interaction.reply('An error occurred');
      }
    }
  };
  
/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */