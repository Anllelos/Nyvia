const {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("example-command")
    .setDescription("Temeplate for a new command! 😉"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor("#7289da")
      .setTitle("Embed Title")
      .setDescription("This is an example description for the Discord embed. You can add more text here to describe what the embed is about.")
      .setImage("https://via.placeholder.com/500x200")
      .setThumbnail("https://via.placeholder.com/80")
      .setAuthor({
        name: "Author Name",
        iconURL: "https://via.placeholder.com/20",
      })
      .setFooter({
        text: "Footer Text",
        iconURL: "https://via.placeholder.com/20",
      })
      .setTimestamp()
      .addFields({ name: "Field 1", value: "Content for field 1 goes here." })
      .addFields({ name: "Field 2", value: "Content for field 2 goes here." });

    await interaction.reply({ embeds: [embed] });
  },
};
