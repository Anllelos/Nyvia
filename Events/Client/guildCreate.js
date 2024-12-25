const {
  Events,
  Guilds,
  Client,
  EmbedBuilder,
  ChannelType,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild, client) {
    const channel = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildText)
      .sort((a, b) => a.rawPosition - b.rawPosition || a.id - b.id)
      .first();
    if (!channel) return;

    const but = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Support")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/YSv9VqQg6g"),

      new ButtonBuilder()
        .setLabel("Vote")
        .setStyle(ButtonStyle.Link)
        .setURL("https://top.gg/bot/1002188910560026634/vote")
    );

    const emb = new EmbedBuilder()
      .addFields({
        name: "Guidelines",
        value:
          "> • I am only running on **slash commands**. <:slashcmd:1101364346505936916>\n> • Find my all commands by using </help:1087992591741624351> command. \n> • Use </bot report-bug:1234> if you found any **bug**. \n\n<:question:1271441987257630793> **If you need any help feel free to join our support server**. \n<:error:1271441954399453265> **Make sure to give my required permissions.**",
        inline: false,
      })
      .setDescription(
        "**Advanced futuristic discord bot with many amazing high functional features like MiniGames, Giveaways, Counting system and many more.**"
      )
      .setAuthor({ name: "❤️ Thanks for adding me!" })
      .setTitle("Hi, I am Razor.")
      .setFooter({ text: "#KeepEvolving" })
      .setTimestamp()
      .setColor(client.config.embed);

    channel.send({ embeds: [emb], components: [but] });
  },
};
