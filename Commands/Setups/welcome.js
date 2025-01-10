const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const WelcomeMessage = require("../../Schemas/welcomeMessageSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-message")
    .setDescription("Configure the welcome message system")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set the welcome message system to the server")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to send welcome messages to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription(
              "The welcome message to send. ` Use {user} to mention the user `"
            )
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("welcome-image")
            .setDescription("Do you want to use a welcome image?")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("embed")
            .setDescription("Send the welcome message as an embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("embed-author")
            .setDescription(
              "Specify the author of the welcome message (only for EMBEDS)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed-title")
            .setDescription(
              "Specify the title of the welcome message (only for EMBEDS)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed-footer")
            .setDescription(
              "Specify the footer of the welcome message (only for EMBEDS)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("embed-color")
            .setDescription("Specify the HEX color of the welcome message (only for EMBEDS). Use format #RRGGBB")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image-bg")
            .setDescription("Give a image link for the welcome image background.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove the welcome message system from the server")
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const isEmbed = interaction.options.getBoolean("embed");
    const isImage = interaction.options.getBoolean("welcome-image");
    const author = interaction.options.getString("embed-author") || "";
    const title = interaction.options.getString("embed-title") || "";
    const image = interaction.options.getString("image-bg") || "";
    let color = interaction.options.getString("embed-color");
    const footer = interaction.options.getString("embed-footer");

    // Validate HEX color format
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i; // Regex for HEX color

    if (color && !hexColorRegex.test(color)) {
      await interaction.reply({
        content: "Invalid HEX color format. Please use #RRGGBB or #RGB.",
        ephemeral: true,
      });
      return;
    }

    let welcomeMessage = await WelcomeMessage.findOne({ guildId });
    if (!welcomeMessage) {
      welcomeMessage = new WelcomeMessage({ guildId });
    }

    if (subcommand === "set") {
      const channelId = interaction.options.getChannel("channel").id;
      const message = interaction.options.getString("message");
      welcomeMessage.channelId = channelId;
      welcomeMessage.message = message;
      welcomeMessage.isEmbed = isEmbed;
      welcomeMessage.author = author;
      welcomeMessage.title = title;
      welcomeMessage.footer = footer;
      welcomeMessage.image = image;
      welcomeMessage.color = color || "#FFFFFF"; // Default to white if no color is provided
      welcomeMessage.isImage = isImage;

      await welcomeMessage.save();

      const successEmbed = new EmbedBuilder()
        .setTitle("Welcome Message System")
        .setColor(welcomeMessage.color) // Use the user-provided HEX color
        .setDescription(
          `Welcome message set to: ${message}.\n\nChannel: <#${channelId}>\nEmbed: ${
            isEmbed ? "Yes" : "No"
          }\nImage: ${isImage ? "Yes" : "No"}`
        );

      await interaction.reply({ embeds: [successEmbed] });
    } else if (subcommand === "remove") {
      await WelcomeMessage.deleteOne({ guildId });
      await interaction.reply({
        content: "Welcome message system has been removed.",
        ephemeral: true,
      });
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */