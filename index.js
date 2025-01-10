/*
██████╗  █████╗ ███████╗ ██████╗ ██████╗ 
██╔══██╗██╔══██╗╚══███╔╝██╔═══██╗██╔══██╗
██████╔╝███████║  ███╔╝ ██║   ██║██████╔╝
██╔══██╗██╔══██║ ███╔╝  ██║   ██║██╔══██╗
██║  ██║██║  ██║███████╗╚██████╔╝██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝

Developed by: @arpandevv. All rights reserved. (2024)
MIT License
*/
require("dotenv").config();
const {
  Client,
  MessageType,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionsBitField,
  AuditLogEvent,
  AttachmentBuilder,
  EmbedBuilder,
  ChannelType,
  ActivityType,
  ModalBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  Events,
} = require("discord.js");

// Modules
const fs = require("fs");
const express = require("express");
const { REST } = require("@discordjs/rest");
const chalk = require("chalk");
const dayjs = require("dayjs");
const url = require("url");
const session = require("express-session");
const { CaptchaGenerator } = require("captcha-canvas");
const { createCanvas } = require("canvas");
const { Connectors } = require("shoukaku");
const { Kazagumo, Payload, Plugins } = require("kazagumo");
const Spotify = require('kazagumo-spotify');
const KazagumoFilter = require("kazagumo-filter");


// Managers
const config = require('./config');
const GiveawaysManager = require("./Handlers/giveaway");
const { handleLogs } = require("./Events/Other/handleLogs");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { prefixCommands } = require("./Handlers/prefixHandler");
const { loadModals } = require("./Handlers/modalHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

client.config = require("./config");
client.cooldowns = new Collection();
client.pcommands = new Collection();
client.aliases = new Collection();
client.commands = new Collection();
client.events = new Collection();
client.modals = new Collection();
client.buttons = new Collection();
client.setMaxListeners(25);

const Nodes = [
  {
    name: config.lavalink.name,
    url: config.lavalink.url,
    auth: config.lavalink.auth,
    secure: config.lavalink.secure,
  },
];

client.manager = new Kazagumo(
  {
    defaultSearchEngine: "spotify",
    plugins: [new Plugins.PlayerMoved(client), new KazagumoFilter(), new Spotify({
      clientId: 'fb7d48240d9949739fc7cf07d9b0632e',
      clientSecret: '7f1c4a66ac134c0aa41d54cc2c9f6858',
      playlistPageLimit: 1,
      albumPageLimit: 1,
      searchLimit: 10,
      searchMarket: 'IN',
    }),],
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  Nodes
);
const timestamp = new Date()
  .toLocaleString("en-GB", { hour12: false })
  .replace(",", "");
client.manager.shoukaku.on("ready", (name) =>
  console.log(
    `${timestamp} - ${chalk.blueBright("Razor")} => ${chalk.yellowBright(
      "Lavalink"
    )} - Lavalink ${name}: Ready!`
  )
);
client.manager.shoukaku.on("error", (name, error) =>
  console.error(`Lavalink ${name}: Error Caught,`, error)
);
client.manager.shoukaku.on("close", (name, code, reason) =>
  console.warn(
    `Lavalink ${name}: Closed, Code ${code}, Reason ${reason || "No reason"}`
  )
);

const Logs = require("discord-logs");
const process = require("node:process");
Logs(client, {
  debug: true,
});

client.giveawayManager = new GiveawaysManager(client, {
  default: {
    botsCanWin: false,
    embedColor: client.config.embed,
    embedColorEnd: client.config.embed,
    reaction: "🎉",
  },
});
loadEvents(client);
client
  .login(process.env.token)
  .then(() => {
    prefixCommands(client);
    loadCommands(client);
    loadModals(client);
    loadButtons(client);
    handleLogs(client);
  })
  .catch((err) => console.log(err));

// Error Handler

client.on("error", (err) => {
  const ChannelID = client.config.logchannel;
  console.log("Discord API Error:", err);
  const Embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTimestamp()
    .setFooter({ text: "⚠️ Anti Crash system" })
    .setTitle("Error Encountered");
  const Channel = client.channels.cache.get(ChannelID);
  if (!Channel) return;
  Channel.send({
    embeds: [
      Embed.setDescription(
        "**Discord API Error/Catch:\n\n** ```" + err + "```"
      ),
    ],
  });
});
process.on("unhandledRejection", (reason, p) => {
  const ChannelID = client.config.logchannel;
  console.log(" [Error_Handling] :: Unhandled Rejection/Catch", reason, p);
  const Embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTimestamp()
    .setFooter({ text: "⚠️ Anti Crash system" })
    .setTitle("Error Encountered");
  const Channel = client.channels.cache.get(ChannelID);
  if (!Channel) return;
  Channel.send({
    embeds: [
      Embed.setDescription(
        "**Unhandled Rejection/Catch:\n\n** ```" + reason + "```"
      ),
    ],
  });
});

process.on("uncaughtException", (err, origin) => {
  const ChannelID = client.config.logchannel;
  console.log("Uncaught Exception:", err, origin);
  const Embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTimestamp()
    .setFooter({ text: "⚠️ Anti Crash system" })
    .setTitle("Error Encountered");
  const Channel = client.channels.cache.get(ChannelID);
  if (!Channel) return;
  Channel.send({
    embeds: [
      Embed.setDescription(
        "**Uncought Exception/Catch:\n\n** ```" + err + "```"
      ),
    ],
  });
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  const ChannelID = client.config.logchannel;
  console.log("Uncaught Exception Monitor:", err, origin);
  const Embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTimestamp()
    .setFooter({ text: "⚠️ Anti Crash system" })
    .setTitle("Error Encountered");
  const Channel = client.channels.cache.get(ChannelID);
  if (!Channel) return;
  Channel.send({
    embeds: [
      Embed.setDescription(
        "**Uncaught Exception Monitor/Catch:\n\n** ```" + err + "```"
      ),
    ],
  });
});

process.on("warning", (warn) => {
  const ChannelID = client.config.logchannel;
  console.log("Warning:", warn);
  const Embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTimestamp()
    .setFooter({ text: "⚠️ Anti Crash system" })
    .setTitle("Error Encountered");
  const Channel = client.channels.cache.get(ChannelID);
  if (!Channel) return;
  Channel.send({
    embeds: [Embed.setDescription("**Warning/Catch:\n\n** ```" + warn + "```")],
  });
});

// -----------------------------------------------
// Music System
client.manager.on("playerStart", async (player, track) => {
  try {
    const playerStartEvent = require("./Events/Lavalink/playerStart.js");
    await playerStartEvent.execute(client, player, track);
  } catch (error) {
    console.error(`Error executing playerStart Event: ${error}`);
  }
});

client.manager.on("playerEmpty", async (player) => {
  try {
    const playerEmptyEvent = require("./Events/Lavalink/playerEmpty.js");
    await playerEmptyEvent.execute(client, player);
  } catch (error) {
    console.error(`Error executing playerEmpty Event: ${error}`);
  }
});

client.manager.on("playerEnd", async (player) => {
  try {
    const playerEndEvent = require("./Events/Lavalink/playerEnd.js");
    await playerEndEvent.execute(client, player);
  } catch (error) {
    console.error(`Error executing playerEnd Event: ${error}`);
  }
});

// -----------------------------------------------
// Dashboard System
const port = 5500;
const app = express();
const bodyParser = require("body-parser");
const rest = new REST({ version: "10" }).setToken(process.env.token);
const { Routes } = require("discord-api-types/v10");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "axaus",
    resave: false,
    saveUninitialized: true,
  })
);

//Server static files from dasboard folder
app.use("/html", express.static("Dashboard/html"));
app.use("/css", express.static("Dashboard/css"));

// server the index.html file for the rooth path
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Dashboard/html/index.html");
});
// 0Auth2 Redirect
app.get("/api/auth/discord/redirect", async (req, res) => {
  const { code } = req.query;
  if (code) {
    const formData = new url.URLSearchParams({
      client_id: process.env.ClientID,
      client_secret: process.env.ClientSecret,
      grant_type: "authorization_code",
      code: code.toString(),
      redirect_uri: `http://localhost:${port}/api/auth/discord/redirect`,
    });
    try {
      const output = await axios.post(
        "https://discord.com/api/v10/oauth2/token",
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (output.data) {
        const access = output.data.access_token;
        const userinfo = await axios.get(
          "https://discord.com/api/v10/users/@me",
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
        // ---------------------------
        const guilds = await axios.get(
          "https://discord.com/api/v10/users/@me/guilds",
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );

        const avatarUrl = `https://cdn.discordapp.com/avatars/${userinfo.data.id}/${userinfo.data.avatar}.png`;

        req.session.user = {
          username: userinfo.data.username,
          avatar: avatarUrl,
          guilds: guilds.data,
        };

        // ---------------------------
        res.redirect("/html/dashboard.html");
      }
    } catch (error) {
      console.error("Error during Oauth2 token exchange", error);
      res.status(500).send("Authentication Failed");
    }
  } else {
    res.status(400).send("No code provied");
  }
});

// --------------------
app.get("/api/user-info", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.get("/api/bot-guilds", async (req, res) => {
  try {
    const botGuilds = await rest.get(Routes.userGuilds());
    res.json(botGuilds);
  } catch (error) {
    console.error("Error fetching bot guilds,", error);
  }
});
// --------------------

app.listen(port, () => {
  console.log(
    `${chalk.white.bold(
      `${dayjs().format("DD/MM/YYYY HH:mm:ss")}`
    )} - ${chalk.blue.bold(`Razor`)} => ${chalk.blue.bold(
      `Dashboard`
    )} - Launched On: http://localhost:${port}`
  );
});

// -----------------------------------------------

client.on("guildDelete", (guild) => {
  console.log("Left a guild: " + guild.name);

  const embed = new EmbedBuilder()
    .setTitle(`Left A Server`)
    .setColor(`Red`)
    .setTimestamp()
    .addFields(
      {
        name: `Guild ID`,
        value: `${guild.id}`,
      },
      {
        name: `Guild Name`,
        value: `${guild.name}`,
      }
    );
  client.channels.cache
    .get(client.config.logchannel)
    .send({ content: `Owner ID: ${guild.ownerId}`, embeds: [embed] });
});

client.on("guildCreate", (guild) => {
  console.log("Joined a new guild: " + guild.name);

  const embed = new EmbedBuilder()
    .setTitle(`**Joined A New Server**`)
    .setColor(`Green`)
    .setTimestamp()
    .addFields(
      {
        name: `Guild ID`,
        value: `${guild.id}`,
      },
      {
        name: `Guild Name`,
        value: `${guild.name}`,
      },
      {
        name: `Guild Members`,
        value: `${guild.memberCount}`,
      },
      {
        name: `Vanity`,
        value: `${guild.vanityURLCode}`,
      }
    );
  client.channels.cache
    .get(client.config.logchannel)
    .send({ content: `Owner ID: ${guild.ownerId}`, embeds: [embed] });
});

// Mention Reply
client.on(Events.MessageCreate, async (message) => {
  if (message.content !== `<@${client.config.clientID}>`) {
    return;
  }

  // Fetch the help command ID
  const helpCommand = await client.application.commands.fetch(); // Fetch all commands
  const helpCommandId = helpCommand.find(cmd => cmd.name === 'help')?.id; // Find the help command ID

  const embed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setTitle("👋 Hello, I'm Razor!")
    .setDescription("Your friendly neighborhood bot, here to assist you! 🤖")
    .addFields(
      { name: '✨ Prefix', value: '`/`', inline: true },
      { name: '📚 Help', value: helpCommandId ? `</help:${helpCommandId}>` : 'Help command not found.', inline: true },
      { name: '🔗 Invite Me', value: `[Click here to invite Razor to your server!](https://discord.com/api/oauth2/authorize?client_id=${client.config.clientID}&permissions=8&scope=bot%20applications.commands)` }
    )
    .setFooter({ text: "Thanks for using Razor! We're always here to help." })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
});

// Guess The Number
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const Schema = require("./Schemas/guess");
  // 29648
  const data = await Schema.findOne({ channelId: message.channel.id });

  if (!data) return;

  if (data) {
    if (message.content === `${data.number}`) {
      message.react(`<:tick:1271441993532444763>`);
      message.reply(`Wow! That was the right number! 🥳`);
      message.pin();

      await data.delete();
      message.channel.send(
        `Successfully delted number, use \`/guess enable\` to get a new number!`
      );
    }

    if (message.content !== `${data.number}`) return message.react(`❌`);
  }
});

//reminder
const remindSchema = require("./Schemas/remindSchema");
setInterval(async () => {
  const reminders = await remindSchema.find();
  if (!reminders) return;
  else {
    reminders.forEach(async (reminder) => {
      if (reminder.Time > Date.now()) return;

      const user = await client.users.fetch(reminder.User);

      user
        ?.send({
          content: `${user}, you asked me to remind you about: \`${reminder.Remind}\``,
        })
        .catch((err) => {
          return;
        });

      await remindSchema.deleteMany({
        Time: reminder.Time,
        User: user.id,
        Remind: reminder.Remind,
      });
    });
  }
}, 1000 * 5);

// Phoning

client.on(Events.MessageCreate, async (message) => {
  if (message.guild === null) return;
  const phoneschema = require("./Schemas/phoneschema");
  const phonedata = await phoneschema.findOne({ Guild: message.guild.id });

  if (!phonedata) return;
  else {
    const phonechannel = client.channels.cache.get(phonedata.Channel);

    if (message.author.id === client.config.clientID) return;
    if (phonechannel.id !== message.channel.id) return;

    try {
      message.react("📧");
    } catch (err) {
      throw err;
    }

    multidata = await phoneschema.find({ Setup: "defined" });

    await Promise.all(
      multidata.map(async (data) => {
        const phonechannels = await client.channels.fetch(data.Channel);
        let phonemessage = message.content || "**No message provided!**";
        const filtermessage = phonemessage.toLowerCase();

        if (message.channel.id === phonechannels.id) return;

        const phoneembed = new EmbedBuilder()
          .setColor(client.config.embed)
          .setFooter({
            text: `📞 Message Received from: ${message.guild.name.slice(
              0,
              180
            )}`,
          })
          .setAuthor({ name: `📞 Phone System` })

          .setTimestamp()
          .setTitle(`> ${message.author.tag.slice(0, 256)}`)
          .setDescription(`${phonemessage.slice(0, 4000)}`);

        phonechannels
          .send({ embeds: [phoneembed] })
          .catch((err) =>
            console.log("Error received trying to phone a message!")
          );
        return phonechannels;
      })
    );
  }
});

// Join to Create
const joinschema = require("./Schemas/jointocreate");
const joinchannelschema = require("./Schemas/jointocreatechannels");

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (!newState.guild) return;
  try {
    if (newState.member.guild === null) return;
  } catch (err) {
    return;
  }
  if (!newState.member.guild) return;

  if (newState.member.id === client.config.clientID) return;

  const joindata = await joinschema.findOne({
    Guild: newState.member.guild.id,
  });
  const joinchanneldata1 = await joinchannelschema.findOne({
    Guild: newState.member.guild.id,
    User: newState.member.id,
  });

  const voicechannel = newState.channel;

  if (!joindata) return;

  if (!voicechannel) return;
  else {
    if (voicechannel.id === joindata.Channel) {
      if (joinchanneldata1) {
        try {
          const joinfail = new EmbedBuilder()
            .setColor(client.config.embed)
            .setTimestamp()
            .setAuthor({ name: `🔊 Join to Create System` })
            .setFooter({ text: `🔊 Issue Faced` })
            .setTitle("> You tried creating a \n> voice channel but..")
            .addFields({
              name: `• Error Occured`,
              value: `> You already have a voice channel \n> open at the moment.`,
            });

          return await newState.member.send({ embeds: [joinfail] });
        } catch (err) {
          return;
        }
      } else {
        try {
          const channel = await newState.member.guild.channels.create({
            type: ChannelType.GuildVoice,
            name: `${newState.member.user.username}-room`,
            userLimit: joindata.VoiceLimit,
            parent: joindata.Category,
          });

          try {
            await newState.member.voice.setChannel(channel.id);
          } catch (err) {
            console.log("Error moving member to the new channel!");
          }

          setTimeout(() => {
            joinchannelschema.create({
              Guild: newState.member.guild.id,
              Channel: channel.id,
              User: newState.member.id,
            });
          }, 500);
        } catch (err) {
          console.log(err);

          try {
            const joinfail = new EmbedBuilder()
              .setColor(client.config.embed)
              .setTimestamp()
              .setAuthor({ name: `🔊 Join to Create System` })
              .setFooter({ text: `🔊 Issue Faced` })
              .setTitle("> You tried creating a \n> voice channel but..")
              .addFields({
                name: `• Error Occured`,
                value: `> I could not create your channel, \n> perhaps I am missing some permissions.`,
              });

            await newState.member.send({ embeds: [joinfail] });
          } catch (err) {
            return;
          }

          return;
        }

        try {
          const joinsuccess = new EmbedBuilder()
            .setColor(client.config.embed)
            .setTimestamp()
            .setAuthor({ name: `🔊 Join to Create System` })
            .setFooter({ text: `🔊 Channel Created` })
            .setTitle("> Channel Created")
            .addFields({
              name: `• Channel Created`,
              value: `> Your voice channel has been \n> created in **${newState.member.guild.name}**!`,
            });

          await newState.member.send({ embeds: [joinsuccess] });
        } catch (err) {
          return;
        }
      }
    }
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (oldState.member.guild === null) return;
  } catch (err) {
    return;
  }

  if (oldState.member.id === client.config.clientID) return;

  const leavechanneldata = await joinchannelschema.findOne({
    Guild: oldState.member.guild.id,
    User: oldState.member.id,
  });

  if (!leavechanneldata) return;
  else {
    const voicechannel = await oldState.member.guild.channels.cache.get(
      leavechanneldata.Channel
    );

    if (newState.channel === voicechannel) return;

    try {
      await voicechannel.delete();
    } catch (err) {
      return;
    }

    await joinchannelschema.deleteMany({
      Guild: oldState.guild.id,
      User: oldState.member.id,
    });
    try {
      const deletechannel = new EmbedBuilder()
        .setColor(client.config.embed)
        .setTimestamp()
        .setAuthor({ name: `🔊 Join to Create System` })
        .setFooter({ text: `🔊 Channel Deleted` })
        .setTitle("> Channel Deleted")
        .addFields({
          name: `• Channel Deleted`,
          value: `> Your voice channel has been \n> deleted in **${newState.member.guild.name}**!`,
        });

      await newState.member.send({ embeds: [deletechannel] });
    } catch (err) {
      return;
    }
  }
});

// Verification System
const capschema = require("./Schemas/verify");
const verifyusers = require("./Schemas/verifyusers");
const LeftUsers = require("./Schemas/LeftUsersSchema");

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.customId === "verify") {
    if (interaction.guild === null) return;

    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({
      Guild: interaction.guild.id,
      User: interaction.user.id,
    });

    if (!verifydata)
      return await interaction.reply({
        content: `The **verification system** has been disabled in this server!`,
        ephemeral: true,
      });

    if (verifydata.Verified.includes(interaction.user.id))
      return await interaction.reply({
        content: "You have **already** been verified!",
        ephemeral: true,
      });

    // Function to generate a random string for the captcha
    //
    function generateCaptcha(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let captcha = "";
      for (let i = 0; i < length; i++) {
        captcha += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return captcha;
    }

    // Function to generate the captcha image
    async function generateCaptchaImage(text) {
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(450, 150);
      const ctx = canvas.getContext('2d');
    
      // Clear canvas for transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      // Random background noise
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.font = `${Math.random() * 20 + 10}px Arial`;
        ctx.fillText(
          characters.charAt(Math.floor(Math.random() * characters.length)),
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }
    
      // Draw the captcha letters in a zig-zag pattern
      ctx.font = "bold 50px Arial";
      const letterColors = ["#00FF00", "#FF5733", "#FFD700", "#1E90FF", "#FF69B4"];
      const positions = [];
      for (let i = 0; i < text.length; i++) {
        const x = 50 + i * 70;
        const y = 50 + (i % 2 === 0 ? 30 : 70); // Zig-zag effect
        ctx.fillStyle = letterColors[i % letterColors.length];
        ctx.fillText(text[i], x, y);
        positions.push({ x: x + 25, y: y - 25 }); // Center of each letter
      }
    
      // Draw the zig-zag line
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(positions[0].x, positions[0].y);
      for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(positions[i].x, positions[i].y);
      }
      ctx.stroke();
    
      return canvas.toBuffer();
    }
    
    
    
    
    

    // Example of how you could use the functions
    const captchaText = generateCaptcha(5);
    generateCaptchaImage(captchaText)
      .then(async (buffer) => {
        const attachment = new AttachmentBuilder(buffer, {
          name: `captcha.png`,
        });
        const verifyembed = new EmbedBuilder()
          .setColor(client.config.embed)
          .setAuthor({ name: `✅ Verification Proccess` })
          .setFooter({ text: `✅ Verification Captcha` })
          .setTimestamp()
          .setImage("attachment://captcha.png")
          .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
          .setTitle("> Verification Step: Captcha")
          .setDescription(
            `• Verify value:\n> Please use the button bellow to \n> submit your captcha!`
          );

        const verifybutton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("✅ Enter Captcha")
            .setStyle(ButtonStyle.Success)
            .setCustomId("captchaenter")
        );

        await interaction.reply({
          embeds: [verifyembed],
          components: [verifybutton],
          files: [attachment],
          ephemeral: true,
        });

        if (verifyusersdata) {
          await verifyusers.deleteMany({
            Guild: interaction.guild.id,
            User: interaction.user.id,
          });

          await verifyusers.create({
            Guild: interaction.guild.id,
            User: interaction.user.id,
            Key: captchaText,
          });
        } else {
          await verifyusers.create({
            Guild: interaction.guild.id,
            User: interaction.user.id,
            Key: captchaText,
          });
        }
      })
      .catch((error) => {
        console.error("An error occurred while generating the captcha:", error);
      });
  } else if (interaction.customId === "captchaenter") {
    const vermodal = new ModalBuilder()
      .setTitle(`Verification`)
      .setCustomId("vermodal");

    const answer = new TextInputBuilder()
      .setCustomId("answer")
      .setRequired(true)
      .setLabel("• Please sumbit your Captcha code")
      .setPlaceholder(`Your captcha code input`)
      .setStyle(TextInputStyle.Short);

    const vermodalrow = new ActionRowBuilder().addComponents(answer);
    vermodal.addComponents(vermodalrow);

    await interaction.showModal(vermodal);
  } else if (interaction.customId === "vermodal") {
    if (!interaction.isModalSubmit()) return;

    const userverdata = await verifyusers.findOne({
      Guild: interaction.guild.id,
      User: interaction.user.id,
    });
    const verificationdata = await capschema.findOne({
      Guild: interaction.guild.id,
    });

    if (verificationdata.Verified.includes(interaction.user.id))
      return await interaction.reply({
        content: `You have **already** verified within this server!`,
        ephemeral: true,
      });

    const modalanswer = interaction.fields.getTextInputValue("answer");
    if (modalanswer === userverdata.Key) {
      const verrole = interaction.guild.roles.cache.get(verificationdata.Role);

      try {
        await interaction.member.roles.add(verrole);
      } catch (err) {
        return await interaction.reply({
          content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`,
          ephemeral: true,
        });
      }

      await capschema.updateOne(
        { Guild: interaction.guild.id },
        { $push: { Verified: interaction.user.id } }
      );
      const channelLog = interaction.guild.channels.cache.get(
        client.config.embed
      );
      if (!channelLog) {
        await interaction.reply({
          content: "You have been **verified!**",
          ephemeral: true,
        });
        return;
      } else {
        const channelLogEmbed = new EmbedBuilder()
          .setColor(`Green`)
          .setTitle("⚠️ Someone verified to the server! ⚠️")
          .setDescription(
            `<@${interaction.user.id}> Is been verified to the server!`
          )
          .setTimestamp()
          .setFooter({ text: `Verified Logs` });

        await channelLog.send({ embeds: [channelLogEmbed] });
        await interaction.reply({
          content: "You have been **verified!**",
          ephemeral: true,
        });
      }
    } else {
      const channelLog = interaction.guild.channels.cache.get(
        client.config.logchannel
      );
      if (!channelLog) {
        await interaction.reply({
          content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`,
          ephemeral: true,
        });
        return;
      } else {
        const channelLogEmbed = new EmbedBuilder()
          .setColor(`Red`)
          .setTitle("⚠️ Watch out for a wrong verify attempt! ⚠️")
          .setDescription(
            `<@${interaction.user.id}> Tries a code from the captcha but he failed, It was the wrong one, Take a look at the person maybe he has troubles when entering the code.\n\nMaybe its a bot so keep a eye on him!`
          )
          .setTimestamp()
          .setFooter({ text: `Verified Logs` });

        await channelLog.send({ embeds: [channelLogEmbed] });
        await interaction.reply({
          content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`,
          ephemeral: true,
        });
      }
    }
  }
});

client.on("guildMemberRemove", async (member) => {
  try {
    const userId = member.user.id;
    const userverdata = await verifyusers.findOne({
      Guild: member.guild.id,
      User: userId,
    });
    const verificationdata = await capschema.findOne({
      Guild: member.guild.id,
    });
    if (userverdata && verificationdata) {
      await capschema.updateOne(
        { Guild: member.guild.id },
        { $pull: { Verified: userId } }
      );
      await verifyusers.deleteOne({ Guild: member.guild.id, User: userId });
    }
  } catch (err) {
    console.error(err);
  }
  // If there is a error console will tell you
});

// AFK
const afkSchema = require("./Schemas/afkschema");
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  const check = await afkSchema.findOne({
    Guild: message.guild.id,
    User: message.author.id,
  });
  if (check) {
    const nick = check.Nickname;
    await afkSchema.deleteMany({
      Guild: message.guild.id,
      User: message.author.id,
    });

    await message.member.setNickname(`${nick}`).catch((err) => {
      return;
    });

    const m1 = await message.reply({
      content: `Welcome Back, ${message.author}! I have removed your afk`,
      ephemeral: false,
    });
    setTimeout(() => {
      m1.delete();
    }, 5000);
  } else {
    const members = message.mentions.users.first();
    if (!members) return;
    const Data = await afkSchema.findOne({
      Guild: message.guild.id,
      User: members.id,
    });
    if (!Data) return;

    const member = message.guild.members.cache.get(members.id);
    const msg = Data.Message || `No Reason Given`;

    if (message.content.includes(members)) {
      const m = await message.reply({
        content: `${member.user.tag} is currently AFK, don't mention them at this - Reason: **${msg}**`,
      });
      setTimeout(() => {
        m.delete();
      }, 5000);
    }
  }
});

// Anti Ghost Ping
const ghostSchema = require("./Schemas/ghostpingSchema");
const numSchema = require("./Schemas/ghostNum");

client.on(Events.MessageDelete, async (message) => {
  if (message.guild === null) return;
  const Data = await ghostSchema.findOne({ Guild: message.guild.id });
  if (!Data) return;

  if (!message.author) return;
  if (message.author.bot) return;
  if (!message.author.id === client.user.id) return;
  if (message.author === message.mentions.users.first()) return;

  if (message.mentions.users.first() || message.type === MessageType.reply) {
    let number;
    let time = 15;

    const data = await numSchema.findOne({
      Guild: message.guild.id,
      User: message.author.id,
    });
    if (!data) {
      await numSchema.create({
        Guild: message.guild.id,
        User: message.author.id,
        Number: 1,
      });

      number = 1;
    } else {
      data.Number += 1;
      await data.save();

      number = data.Number;
    }

    if (number == 2) time = 60;
    if (number >= 3) time = 500;

    const msg = await message.channel.send({
      content: `${message.author}, you cannot ghost ping members within this server!`,
    });
    setTimeout(() => msg.delete(), 5000);

    const member = message.member;

    if (
      message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return;
    } else {
      await member.timeout(time * 1000, "Ghost Pinging");
      await member
        .send({
          content: `You have been timed out in ${message.guild.name} for ${time} seconds due to ghost pinging members`,
        })
        .catch((err) => {
          return;
        });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  const countschema = require("./Schemas/counting");
  if (message.guild === null) return;
  const countdata = await countschema.findOne({ Guild: message.guild.id });
  let reaction = "";

  if (!countdata) return;

  let countchannel = client.channels.cache.get(countdata.Channel);
  if (!countchannel) return;
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.id !== countchannel.id) return;

  if (countdata.Count > 98) {
    reaction = "✔️";
  } else if (countdata.Count > 48) {
    reaction = "☑️";
  } else {
    reaction = "✅";
  }

  if (message.author.id === countdata.LastUser) {
    message.reply({
      content: `You **cannot** count alone! You **messed up** the counter at **${countdata.Count}**! Back to **0**.`,
    });
    countdata.Count = 0;
    countdata.LastUser = " ";

    try {
      message.react("❌");
    } catch (err) {}
  } else {
    if (
      message.content - 1 < countdata.Count &&
      countdata.Count === 0 &&
      message.author.id !== countdata.LastUser
    ) {
      message.reply({ content: `The **counter** is at **0** by default!` });
      message.react("⚠");
    } else if (
      message.content - 1 < countdata.Count ||
      message.content === countdata.Count ||
      (message.content > countdata.Count + 1 &&
        message.author.id !== countdata.LastUser)
    ) {
      message.reply({
        content: `You **messed up** the counter at **${countdata.Count}**! Back to **0**.`,
      });
      countdata.Count = 0;

      try {
        message.react("❌");
      } catch (err) {}
    } else if (
      message.content - 1 === countdata.Count &&
      message.author.id !== countdata.LastUser
    ) {
      countdata.Count += 1;

      try {
        message.react(`${reaction}`);
      } catch (err) {}

      countdata.LastUser = message.author.id;
    }
  }

  countdata.save();
});

// Join-Ping
const pingschema = require("./Schemas/joinping");
client.on(Events.GuildMemberAdd, async (member, err) => {
  const pingdata = await pingschema.findOne({ Guild: member.guild.id });

  if (!pingdata) return;
  else {
    await Promise.all(
      pingdata.Channel.map(async (data) => {
        const pingchannels = await client.channels.fetch(data);
        const message = await pingchannels.send(`${member}`).catch(err);

        setTimeout(() => {
          try {
            message.delete();
          } catch (err) {
            return;
          }
        }, 1000);
      })
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    const channel = await client.channels.cache.get(client.config.logchannel);
    const server = interaction.guild.name;
    const user = interaction.user.tag;
    const userId = interaction.user.id;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`⚠️ Chat Command Used!`)
      .addFields({ name: `Server Name`, value: `${server}` })
      .addFields({ name: `Chat Command`, value: `${interaction}` })
      .addFields({ name: `User`, value: `${user} / ${userId}` })
      .setTimestamp()
      .setFooter({ text: `Chat Command Executed` });

    await channel.send({ embeds: [embed] });
  }
});

// MODMAIL CODE //
const modschema = require("./Schemas/modmailschema");
const moduses = require("./Schemas/modmailuses");

client.on(Events.MessageCreate, async (message) => {
  if (message.guild) return;
  if (message.author.id === client.user.id) return;

  const usesdata = await moduses.findOne({ User: message.author.id });

  if (!usesdata) {
    message.react("👋");

    const modselect = new EmbedBuilder()
      .setColor(client.config.embed)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: `📫 Modmail System` })
      .setFooter({ text: `📫 Modmail Selecion` })
      .setTimestamp()
      .setTitle("> Select a Server")
      .addFields({
        name: `• Select a Modmail`,
        value: `> Please submit the Server's ID you are \n> trying to connect to in the modal displayed when \n> pressing the button bellow!`,
      })
      .addFields({
        name: `• How do I get the server's ID?`,
        value: `> To get the Server's ID you will have to enable \n> Developer Mode through the Discord settings, then \n> you can get the Server's ID by right \n> clicking the Server's icon and pressing "Copy Server ID".`,
      });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("selectmodmail")
        .setLabel("• Select your Server")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.reply({
      embeds: [modselect],
      components: [button],
    });
    const selectcollector = msg.createMessageComponentCollector();

    selectcollector.on("collect", async (i) => {
      if (i.customId === "selectmodmail") {
        const selectmodal = new ModalBuilder()
          .setTitle("• Modmail Selector")
          .setCustomId("selectmodmailmodal");

        const serverid = new TextInputBuilder()
          .setCustomId("modalserver")
          .setRequired(true)
          .setLabel("• What server do you want to connect to?")
          .setPlaceholder('Example: "1010869461059911681"')
          .setStyle(TextInputStyle.Short);

        const subject = new TextInputBuilder()
          .setCustomId("subject")
          .setRequired(true)
          .setLabel(`• What's the reason for contacting us?`)
          .setPlaceholder(
            `Example: "I wanted to bake some cookies, but someone didn't let me!!!"`
          )
          .setStyle(TextInputStyle.Paragraph);

        const serveridrow = new ActionRowBuilder().addComponents(serverid);
        const subjectrow = new ActionRowBuilder().addComponents(subject);

        selectmodal.addComponents(serveridrow, subjectrow);

        i.showModal(selectmodal);
      }
    });
  } else {
    if (message.author.bot) return;

    const sendchannel = await client.channels.cache.get(usesdata.Channel);
    if (!sendchannel) {
      message.react("⚠");
      await message.reply(
        "**Oops!** Your **modmail** seems **corrupted**, we have **closed** it for you."
      );
      return await moduses.deleteMany({ User: usesdata.User });
    } else {
      const msgembed = new EmbedBuilder()
        .setColor(client.config.embed)
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
        })
        .setFooter({ text: `📫 Modmail Message - ${message.author.id}` })
        .setTimestamp()
        .setDescription(`${message.content || `**No message provided.**`}`);

      if (message.attachments.size > 0) {
        try {
          msgembed.setImage(`${message.attachments.first()?.url}`);
        } catch (err) {
          return message.react("❌");
        }
      }

      const user = await sendchannel.guild.members.cache.get(usesdata.User);
      if (!user) {
        message.react("⚠️");
        message.reply(
          `⚠️ You have left **${sendchannel.guild.name}**, your **modmail** was **closed**!`
        );
        sendchannel.send(
          `⚠️ <@${message.author.id}> left, this **modmail** has been **closed**.`
        );
        return await moduses.deleteMany({ User: usesdata.User });
      }

      try {
        await sendchannel.send({ embeds: [msgembed] });
      } catch (err) {
        return message.react("❌");
      }

      message.react("📧");
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "selectmodmailmodal") {
    const data = await moduses.findOne({ User: interaction.user.id });
    if (data)
      return await interaction.reply({
        content: `You have **already** opened a **modmail**! \n> Do **/modmail close** to close it.`,
        ephemeral: true,
      });
    else {
      const serverid = interaction.fields.getTextInputValue("modalserver");
      const subject = interaction.fields.getTextInputValue("subject");

      const server = await client.guilds.cache.get(serverid);
      if (!server)
        return await interaction.reply({
          content: `**Oops!** It seems like that **server** does not **exist**, or I am **not** in it!`,
          ephemeral: true,
        });

      const executor = await server.members.cache.get(interaction.user.id);
      if (!executor)
        return await interaction.reply({
          content: `You **must** be a member of **${server.name}** in order to **open** a **modmail** there!`,
          ephemeral: true,
        });

      const modmaildata = await modschema.findOne({ Guild: server.id });
      if (!modmaildata)
        return await interaction.reply({
          content: `Specified server has their **modmail** system **disabled**!`,
          ephemeral: true,
        });

      const channel = await server.channels
        .create({
          name: `modmail-${interaction.user.id}`,
          parent: modmaildata.Category,
        })
        .catch((err) => {
          return interaction.reply({
            content: `I **couldn't** create your **modmail** in **${server.name}**!`,
            ephemeral: true,
          });
        });

      await channel.permissionOverwrites.create(channel.guild.roles.everyone, {
        ViewChannel: false,
      });

      const embed = new EmbedBuilder()
        .setColor(client.config.embed)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setAuthor({ name: `📫 Modmail System` })
        .setFooter({ text: `📫 Modmail Opened` })
        .setTimestamp()
        .setTitle(`> ${interaction.user.username}'s Modmail`)
        .addFields({ name: `• Subject`, value: `> ${subject}` });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("deletemodmail")
          .setEmoji("❌")
          .setLabel("Delete")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("closemodmail")
          .setEmoji("🔒")
          .setLabel("Close")
          .setStyle(ButtonStyle.Secondary)
      );

      await moduses.create({
        Guild: server.id,
        User: interaction.user.id,
        Channel: channel.id,
      });

      await interaction.reply({
        content: `Your **modmail** has been opened in **${server.name}**!`,
        ephemeral: true,
      });
      const channelmsg = await channel.send({
        embeds: [embed],
        components: [buttons],
      });
      channelmsg.createMessageComponentCollector();
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.customId === "deletemodmail") {
    const closeembed = new EmbedBuilder()
      .setColor(client.config.embed)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: `📫 Modmail System` })
      .setFooter({ text: `📫 Modmail Closed` })
      .setTimestamp()
      .setTitle("> Your modmail was Closed")
      .addFields({ name: `• Server`, value: `> ${interaction.guild.name}` });

    const delchannel = await interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    const userdata = await moduses.findOne({ Channel: delchannel.id });

    await delchannel.send("❌ **Deleting** this **modmail**..");

    setTimeout(async () => {
      if (userdata) {
        const executor = await interaction.guild.members.cache.get(
          userdata.User
        );
        if (executor) {
          await executor.send({ embeds: [closeembed] });
          await moduses.deleteMany({ User: userdata.User });
        }
      }

      try {
        await delchannel.delete();
      } catch (err) {
        return;
      }
    }, 100);
  }

  if (interaction.customId === "closemodmail") {
    const closeembed = new EmbedBuilder()
      .setColor(client.config.embed)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: `📫 Modmail System` })
      .setFooter({ text: `📫 Modmail Closed` })
      .setTimestamp()
      .setTitle("> Your modmail was Closed")
      .addFields({ name: `• Server`, value: `> ${interaction.guild.name}` });

    const clchannel = await interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    const userdata = await moduses.findOne({ Channel: clchannel.id });

    if (!userdata)
      return await interaction.reply({
        content: `🔒 You have **already** closed this **modmail**.`,
        ephemeral: true,
      });

    await interaction.reply("🔒 **Closing** this **modmail**..");

    setTimeout(async () => {
      const executor = await interaction.guild.members.cache.get(userdata.User);
      if (executor) {
        try {
          await executor.send({ embeds: [closeembed] });
        } catch (err) {
          return;
        }
      }

      interaction.editReply(
        `🔒 **Closed!** <@${userdata.User}> can **no longer** view this **modmail**, but you can!`
      );

      await moduses.deleteMany({ User: userdata.User });
    }, 100);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const data = await modschema.findOne({ Guild: message.guild.id });
  if (!data) return;

  const sendchanneldata = await moduses.findOne({
    Channel: message.channel.id,
  });
  if (!sendchanneldata) return;

  const sendchannel = await message.guild.channels.cache.get(
    sendchanneldata.Channel
  );
  const member = await message.guild.members.cache.get(sendchanneldata.User);
  if (!member)
    return await message.reply(
      `⚠ <@${sendchanneldata.User} is **not** in your **server**!`
    );

  const msgembed = new EmbedBuilder()
    .setColor(client.config.embed)
    .setAuthor({
      name: `${message.author.username}`,
      iconURL: `${message.author.displayAvatarURL()}`,
    })
    .setFooter({ text: `📫 Modmail Received - ${message.author.id}` })
    .setTimestamp()
    .setDescription(`${message.content || `**No message provided.**`}`);

  if (message.attachments.size > 0) {
    try {
      msgembed.setImage(`${message.attachments.first()?.url}`);
    } catch (err) {
      return message.react("❌");
    }
  }

  try {
    await member.send({ embeds: [msgembed] });
  } catch (err) {
    message.reply(`⚠ I **couldn't** message **<@${sendchanneldata.User}>**!`);
    return message.react("❌");
  }

  message.react("📧");
});

// Reaction Roles System (Animated Emoji)
const reactions = require("./Schemas/reactionrole.js");
const { default: axios } = require("axios");
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });

  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    console.log("Error!");
  }
});

/*
true
500365
4ADRI3L
29648
184761
1736522047
c92c171738798e98c3932fea44bdf86f
*/


// Reaction Roles System (Animated Emoji)
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });

  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.remove(data.Role);
  } catch (e) {
    console.log("Error!");
  }
});

// Reaction Roles System (Static Emoji)
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });

  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    console.log("Error!");
  }
});

// Reaction Roles System (Static Emoji)
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: cID,
  });

  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.remove(data.Role);
  } catch (e) {
    console.log("Error!");
  }
});

/* --------------- AutoRole System ----------------*/

const roleSchema = require("./Schemas/autorole");

client.on("guildMemberAdd", async (member) => {
  const { guild } = member;

  const data = await roleSchema.findOne({ GuildID: guild.id });
  if (!data) return;
  if (data.Roles.length < 0) return;
  for (const r of data.Roles) {
    await member.roles.add(r);
  }
});


// Leveling System Code //
const levelSchema = require("./Schemas/level");
const levelschema = require("./Schemas/levelsetup");
const levelRoleSchema = require("./Schemas/levelRoleSchema");

client.on(Events.MessageCreate, async (message) => {
  const { guild, author, member, channel } = message;

  if (!guild || author.bot) return;

  try {
    const leveldata = await levelschema.findOne({ Guild: guild.id });
    if (!leveldata || leveldata.Disabled === "disabled") return;

    let userData = await levelSchema.findOne({
      Guild: guild.id,
      User: author.id,
    });
    if (!userData) {
      userData = await levelSchema.create({
        Guild: guild.id,
        User: author.id,
        XP: 0,
        Level: 1,
      });
    }

    const baseXP = 8;
    let xpEarned = baseXP;

    const hasMultiplierRole = member.roles.cache.some(
      (role) => role.id === leveldata.Role
    );
    if (hasMultiplierRole) {
      let multiplier = parseFloat(leveldata.Multi);
      if (isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
        multiplier = 1;
      }
      xpEarned = baseXP * multiplier;
    }

    xpEarned = Math.min(xpEarned, 100);

    userData.XP += xpEarned;

    let requiredXP = userData.Level * 40;
    let leveledUp = false;

    while (userData.XP >= requiredXP) {
      userData.XP -= requiredXP;
      userData.Level += 1;
      leveledUp = true;
      requiredXP = userData.Level * 40;
    }

    await userData.save();

    if (leveledUp) {
      const levelembed = new EmbedBuilder()
        .setColor(client.config.embed)
        .setTitle(`> ${author.username} has Leveled Up!`)
        .setDescription(`🎉 **Congratulations!** You've reached **Level ${userData.Level}**!`)
        .setFooter({ text: `Keep up the activity to level up faster!` })
        .setTimestamp();

      const roleData = await levelRoleSchema.findOne({ GuildID: guild.id });
      if (roleData) {
        for (const item of roleData.LevelRoleData) {
          const level = item.level;
          const roleId = item.roleId;
          if (
            !message.member.roles.cache.has(roleId) &&
            userData.Level > level
          ) {
            message.member.roles.add(roleId);
          }
          if (userData.Level === level) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
              message.member.roles.add(role);
              levelembed.setDescription(
                `${author.username}, you have reached ${userData.Level} and got <@&${roleId}>!`
              );
            }
          }
        }
      }

      await channel.send({ embeds: [levelembed] });
    }
  } catch (error) {
    console.error("Error processing leveling system:", error);
  }
});

// AI System
const aiConfig = require("./Schemas/aiSchema.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Prodia } = require("prodia.js");
const { Filter } = require('virus-nsfw');
const filter = new Filter(process.env.CLARIFAI_API_KEY); 

const messageHistory = new Map();

client.on("messageCreate", async (message) => {
  if (!message || !message.guild) return;
  let data = await aiConfig.findOne({ guildId: message.guild.id });

  if (message.author.bot) return;

  if (!data) return;

  const channelId = data.channelId;

  if (data.blacklists.includes(message.author.id)) {
    await message.reply(`You cannot use AI here as you are blacklisted.`);
    return;
  }

  if (message.channel.id !== channelId) return;
  else {
    let input = message.content;

    if (!messageHistory.has(message.guild.id)) {
      messageHistory.set(message.guild.id, []);
    }

    const history = messageHistory.get(message.guild.id);
    history.push(`:User  ${input}`);
    
    if (history.length > 5) {
      history.shift(); 
    }
    const prompt = history.join('\n') + '\nAI:';
    if (input.startsWith("imagine") || input.startsWith("draw")) {
      
    } else {
      
      const ai = new GoogleGenerativeAI(client.config.gemini_api);
      const generationConfig = {
        maxOutputTokens: 500,
      };

      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig,
      });
      const result = await model.generateContent(prompt);
      const sanitizedResponse = result.response.text().replace(/@everyone/g, '@\u200Beveryone').replace(/@here/g, '@\u200Bhere');

      history.push(`AI: ${sanitizedResponse}`);

      await message.reply(sanitizedResponse);
    }
  }
});

// Snipe 
client.on('messageDelete', (message) => {
  // Call the onMessageDelete function from your snipe command module
  require('./Commands/Moderation/snipe.js').onMessageDelete(message);
});

// Pterodactyl Commands 
const Schema = require('./Schemas/ptero');
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  
  const { commandName, options, user } = interaction;

  if (commandName === 'pterodactyl') {
      const focusedOption = options.getFocused(true);
      
      if (focusedOption.name === 'server') {
          const credentials = await Schema.findOne({ discordId: user.id });
          if (!credentials) {
              return interaction.respond([]);
          }
          
          const { panelURL, apiKey } = credentials;

          const axiosInstance = require('axios').create({
              baseURL: panelURL.replace(/\/$/, ""),
              headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });

          try {
              const res = await axiosInstance.get('/api/client');
              const servers = res.data.data; 
              const query = focusedOption.value.toLowerCase();

              const filtered = servers
                  .filter(s => 
                      s.attributes.name.toLowerCase().includes(query) || 
                      s.attributes.identifier.toLowerCase().includes(query)
                  )
                  .map(s => ({
                      name: s.attributes.name,
                      value: s.attributes.identifier 
                  }))
                  .slice(0, 25);
              
              await interaction.respond(filtered);
          } catch (err) {
              console.error(err);
              await interaction.respond([]);
          }
      }
  }
});

// Booster Notification 
const BoosterChannel = require('./Schemas/boosterChannel');
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (!oldMember.premiumSince && newMember.premiumSince) {
    const boosterChannelData = await BoosterChannel.findOne();
    const idchannel = boosterChannelData ? boosterChannelData.channelId : null;

    if (idchannel) {
      const channel = client.channels.cache.get(idchannel);
      if (channel) {
        let avatarURL = newMember.user.displayAvatarURL({ format: 'webp', dynamic: true, size: 1024 });
        avatarURL = avatarURL.replace('.webp', '.png');
        let embed = new EmbedBuilder()
          .setColor('FFC0CB')
          .setTitle("Thank You for Boosting!")
          .setDescription(`Thank you ${newMember.user.toString()}, for boosting our server! Your support means a lot to us.`)
          .setThumbnail(newMember.user.displayAvatarURL({ format: "png", dynamic: true }))
          .setImage(`https://api.aggelos-007.xyz/boostcard?avatar=${avatarURL}&username=${newMember.user.username}`)
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      } else {
        console.error(`Channel with ID ${idchannel} not found.`);
      }
    } else {
      console.error('No booster channel set in the database.');
    }
  }
});

/*
const TicketSchema = require('./Schemas/Ticket');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, guild, channel, member } = interaction;

    switch (customId) {
        case 'reopen-ticket':
            // Logic to reopen the ticket and add the ticket opener back
            const ticketData = await TicketSchema.findOne({ GuildID: guild.id, ChannelID: channel.id });
            if (!ticketData) {
                return interaction.reply({ content: 'Ticket data not found.', ephemeral: true });
            }

            // Add the ticket opener back to the channel
            await channel.permissionOverwrites.edit(ticketData.OwnerID, { 
                [PermissionFlagsBits.ViewChannel]: true 
            });

            // Add other members back to the channel
            for (const memberId of ticketData.MembersID) {
                await channel.permissionOverwrites.edit(memberId, { 
                    [PermissionFlagsBits.ViewChannel]: true 
                });
            }

            await interaction.reply({ content: 'The ticket has been reopened!', ephemeral: false });
            break;

        case 'transcript-ticket':
            // Logic to generate and send the transcript
            const transcript = await createTranscript(channel, {
                limit: -1,
                returnType: 'attachment',
                saveImages: true,
                poweredBy: false,
                filename: `transcript-${channel.name}.html`,
            });

            await interaction.reply({ content: 'Transcript generated!', files: [transcript] });
            break;

        case 'delete-ticket':
            // Logic to confirm deletion and delete the channel
            await interaction.reply({ content: 'This channel will be deleted in 5 seconds.', ephemeral: true });
            await TicketSchema.findOneAndDelete({ GuildID: guild.id, ChannelID: channel.id });
            setTimeout(() => {
                channel.delete().catch(error => { console.error('Failed to delete channel:', error); });
            }, 5000);
            break;
    }
});
*/
module.exports = client;

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */