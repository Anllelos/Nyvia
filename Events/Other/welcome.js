const { Events, EmbedBuilder } = require("discord.js");
const WelcomeMessage = require("../../Schemas/welcomeMessageSchema");
const { Card } = require("welcomify");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeMessage = await WelcomeMessage.findOne({
      guildId: member.guild.id,
    });

    if (!welcomeMessage) return;

    const image = welcomeMessage.image || "https://i.imgur.com/GMuBRQo.jpeg"
    const author = welcomeMessage.author || "";
    const title = welcomeMessage.title || "";
    const footer = welcomeMessage.footer || "";
    const color = welcomeMessage.color || "Random";
    const isImage = welcomeMessage.isImage;

    // Welcomify
    const card = new Card()
      .setTitle("Welcome")
      .setName(member.user.username)
      .setAvatar(member.user.displayAvatarURL({ format: "png", dynamic: true }))
      .setMessage(`You are the ${member.guild.memberCount}th to join`)
      .setBackground(image)
      .setColor("00FF38");
    const cardoutput = await card.build();

    const channel = member.guild.channels.cache.get(welcomeMessage.channelId);
    const messageContent = welcomeMessage.message.replace(
      "{user}",
      member.user.toString()
    );

    if (welcomeMessage.isEmbed) {
      const embed = new EmbedBuilder().setColor(color);

      if (author) {
        embed.setAuthor({ name: `${author}` });
      }

      if (title) {
        embed.setTitle(title);
      }

      if (footer) {
        embed.setFooter({ text: `${footer}` });
      }

      await channel.send({ content: messageContent });
      await channel.send({ embeds: [embed] }); // Send the embed
      await channel.send({
        files: [{ attachment: cardoutput, name: "welcome-card.png" }],
      });
    } else {
      await channel.send({
        content: messageContent,
        files: [{ attachment: cardoutput, name: "welcome-card.png" }],
      });
    }
  },
};
