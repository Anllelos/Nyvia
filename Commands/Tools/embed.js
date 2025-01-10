const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ChannelType,
  SlashCommandBuilder,
  PermissionsBitField,
  ButtonStyle,
} = require("discord.js");
const Discord = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create an embed")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel where to post embed")
        .setRequired(true)
    ),
  async execute(interaction, client) {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to make a embed.', ephemeral: true });
  }

    try {
      const channel = interaction.options.getChannel("channel");
      let row = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId("embedSelect")
          .setPlaceholder("Nothing selected")
          .addOptions([
            {
              emoji: "✏️",
              label: "Title",
              description: "Create a embed title",
              value: "title_embed",
            },
            {
              emoji: "✏️",
              label: "Title Url",
              description: "Create a embed title Url",
              value: "title_url",
            },
            {
              emoji: "💬",
              label: "Description",
              description: "Create a embed description",
              value: "description_embed",
            },
            {
              emoji: "🕵️",
              label: "Author",
              description: "Create a embed author",
              value: "author_embed",
            },
            {
              emoji: "🕵️",
              label: "Author Image",
              description: "Create a embed author images",
              value: "author_image",
            },
            {
              emoji: "🔻",
              label: "Footer",
              description: "Create a embed footer",
              value: "footer_embed",
            },
            {
              emoji: "🔻",
              label: "Footer Image",
              description: "Create a embed footer image",
              value: "footer_image",
            },
            {
              emoji: "🔳",
              label: "Thumbnail",
              description: "Create a embed thumbnail",
              value: "thumbnail_embed",
            },
            {
              emoji: "🕙",
              label: "Timestamp",
              description: "Create a embed timestamp",
              value: "timestamp_embed",
            },
            {
              emoji: "🖼️",
              label: "Image",
              description: "Create a embed image",
              value: "image_embed",
            },
            {
              emoji: "🔵",
              label: "Color",
              description: "Create a embed color",
              value: "color_embed",
            },
            {
              emoji: "🔘",
              label: "button url",
              description: "create url buttons in embed",
              value: "button",
            },
          ])
      );
      let row2 = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("send_embed")
          .setEmoji("✅")
          .setLabel("Send embed")
          .setStyle(Discord.ButtonStyle.Success)
      );
      let rowb = new Discord.ActionRowBuilder();
      let embed = new Discord.EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Some title")
        .setURL(
          "https://builtbybit.com/resources/razor-an-all-in-one-discord-bot.29648//"
        )
        .setAuthor({
          name: "Some name",
          iconURL: "https://i.imgur.com/uEjgSmT.png",
          url: "https://builtbybit.com/resources/razor-an-all-in-one-discord-bot.29648/",
        })
        .setDescription("Some description here")
        .setThumbnail("https://i.imgur.com/uEjgSmT.png")
        .setImage("https://i.imgur.com/ppPy7A5.png")
        .setTimestamp()
        .setFooter({
          text: "Some footer text here",
          iconURL: "https://i.imgur.com/lWJ1jjg.png",
        });
      interaction.reply({
        embeds: [embed],
        components: [row, row2],
      });
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
      });
      collector.on("collect", async (i) => {
        if (i.customId === "embedSelect") {
          i.deferUpdate();
          if (i.values == "title_embed") {
            interaction.channel
              .send({
                content: "Please enter a title",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    embed.setTitle(`${collected.first().content}`);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "title_url") {
            interaction.channel
              .send({
                content: "Please enter a url",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    if (
                      !collected.first().content.includes("http://") &&
                      !collected.first().content.includes("https://")
                    )
                      return interaction.channel.send({
                        content: "Incorrect url!",
                      });
                    embed.setURL(`${collected.first().content}`);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "description_embed") {
            interaction.channel
              .send({
                content: "Please enter a description",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    embed.setDescription(`${collected.first().content}`);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "author_embed") {
            interaction.channel
              .send({
                content: "Please enter a author",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    embed.setAuthor({
                      name: `${collected.first().content}`,
                    });
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "author_image") {
            interaction.channel
              .send({
                content: "Please enter a url",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    if (
                      !collected.first().content.includes("http://") &&
                      !collected.first().content.includes("https://")
                    )
                      return interaction.channel.send({
                        content: "Incorrect url!",
                      });
                    embed.setAuthor({
                      iconUrl: `${collected.first().content}`,
                    });
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "footer_embed") {
            interaction.channel
              .send({
                content: "Please enter a footer",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    embed.setFooter({
                      text: `${collected.first().content}`,
                    });
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "footer_image") {
            interaction.channel
              .send({
                content: "Please enter a url",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    if (
                      !collected.first().content.includes("http://") &&
                      !collected.first().content.includes("https://")
                    )
                      return interaction.channel.send({
                        content: "Incorrect url!",
                      });
                    embed.setFooyer({
                      iconUrl: `${collected.first().content}`,
                    });
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "thumbnail_embed") {
            interaction.channel
              .send({
                content: "Please enter a thumbnail",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    if (
                      !collected.first().content.includes("http://") &&
                      !collected.first().content.includes("https://")
                    )
                      return interaction.channel.send({
                        content: "Incorrect thumbnail link!",
                      });
                    embed.setThumbnail(`${collected.first().content}`);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "thumbnail_embed") {
            embed.setTimestamp();
            interaction.editReply({
              embeds: [embed],
            });
          }
          if (i.values == "image_embed") {
            interaction.channel
              .send({
                content: "Please enter a image",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    if (
                      !collected.first().content.includes("http://") &&
                      !collected.first().content.includes("https://")
                    )
                      return interaction.channel.send({
                        content: "Incorrect image link!",
                      });
                    embed.setImage(`${collected.first().content}` || null);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          if (i.values == "color_embed") {
            interaction.channel
              .send({
                content: "Please enter a color. e.g. #FF0000",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    embed.setColor(`${collected.first().content}`);
                    await interaction.editReply({
                      embeds: [embed],
                    });
                  });
              });
          }
          // Remove the default button from rowb initialization
          // Initialize without any components
          // Inside the "button" case in the collector
          if (i.values == "button") {
            // Prompt for field name
            interaction.channel
              .send({
                content: "Please enter the button name",
              })
              .then((message) => {
                const filterMessage = (m) =>
                  m.author.id === interaction.user.id && !m.author.bot;
                interaction.channel
                  .awaitMessages({
                    filterMessage,
                    max: 1,
                    time: 300000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    message.delete({
                      timeout: 1000,
                    });
                    collected.delete({
                      timeout: 1000,
                    });
                    const ButtonName = collected.first().content;
                    // Prompt for field value
                    interaction.channel
                      .send({
                        content: "Please enter the Button Url",
                      })
                      .then((message) => {
                        interaction.channel
                          .awaitMessages({
                            filterMessage,
                            max: 1,
                            time: 300000,
                            errors: ["time"],
                          })
                          .then(async (collected) => {
                            message.delete({
                              timeout: 1000,
                            });
                            collected.delete({
                              timeout: 1000,
                            });
                            const ButtonUrl = collected.first().content;
                            // Add the button to rowb
                            rowb.addComponents(
                              new Discord.ButtonBuilder()
                                .setLabel(ButtonName)
                                .setURL(ButtonUrl)
                                .setStyle(Discord.ButtonStyle.Link)
                            );
                            await interaction.editReply({
                              embeds: [embed],
                              components: [rowb, row2],
                            });
                          });
                      });
                  });
              });
          }
        }
        if (i.customId == "send_embed") {
          if (!channel) {
            return interaction.reply({
              embeds: [new EmbedBuilder().setTitle("Channel Not Found")],
            });
          }
          interaction.editReply({
            content: `Embed has been sent to ${channel}.`,
            embeds: [],
            components: [],
            ephemeral: true,
          });
          // Prepare the components to send
          const componentsToSend = rowb.components.length > 0 ? [rowb] : []; // Only include rowb if it has components
          await channel.send({
            embeds: [embed],
            components: componentsToSend, // Send only if there are components
          });
          collector.stop();
        }
      });
    } catch (error) {
      console.error(client, interaction, error);
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */