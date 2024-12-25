const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const User = require('../../Schemas/userAccount');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-account')
    .setDescription('Delete your economy account.'),
  async execute(interaction, client) {
    try {
      const user = await User.findOne({ userId: interaction.user.id });
      if (!user) {
        return interaction.reply({ content: `Your account does not exist.`, ephemeral: true});
      }

      const confirmButton = new ButtonBuilder()
        .setCustomId('confirm-delete')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);

      const cancelButton = new ButtonBuilder()
        .setCustomId('cancel-delete')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents([confirmButton, cancelButton]);

      const embed = new EmbedBuilder()
        .setTitle('Delete Account')
        .setDescription('Are you sure you want to delete your economy account?')
        .setColor(client.config.embed);

      await interaction.reply({ embeds: [embed], components: [row] });

      const filter = (i) => i.customId === 'confirm-delete' || i.customId === 'cancel-delete';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (i) => {
        if (i.customId === 'confirm-delete') {
          await User.findOneAndDelete({ userId: interaction.user.id });
          await i.update({ content: `Your Account Has Been Deleted.`, components: [], embeds: []});
        } else {
            await i.update({ content: `Deletion Cancelled.`, components: [], embeds: []});
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          interaction.channel.send('Deletion timed out.');
        }
      });

    } catch (error) {
      console.error('Error deleting the account', error);
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */