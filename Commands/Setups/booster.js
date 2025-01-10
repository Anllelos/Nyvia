const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const BoosterChannel = require('../../Schemas/boosterChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booster')
    .setDescription('Manage booster settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the booster notification channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send boost notifications')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
    }
    const channel = interaction.options.getChannel('channel');

    await BoosterChannel.findOneAndUpdate({}, { channelId: channel.id }, { upsert: true });

    return interaction.reply({ content: `Booster notifications will be sent to ${channel}.`, ephemeral: true });
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */