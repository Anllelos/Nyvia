const { Client, ActivityType } = require("discord.js");
const chalk = require("chalk");
const axios = require('axios');
const dayjs = require('dayjs');
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
      let status = [
        {
          name: `$12.99 Source Code Dm @arpandevv`,
          type: ActivityType.Playing,
        },
        {
          name: `/bot info | dsc.gg/razorsupport`,
          type: ActivityType.Listening,
        },
        {
          name: `/bot invite | ${client.commands.size} Commands`,
          type: ActivityType.Listening,
        },
        {
          name: "Made with 💖 by Arpan",
          type: ActivityType.Playing,
        },
        {
          name: `/help | in ${client.guilds.cache.size} Servers 🏆`,
          type: ActivityType.Playing,
        },
        {
          name: `/help | with ${formatNumber(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))} Users 👤`,
          type: ActivityType.Watching,
        },
      ];
  
      function formatNumber(number) {
        if (number >= 1000000) {
          return (number / 1000000).toFixed(1) + "M";
        } else if (number >= 1000) {
          return (number / 1000).toFixed(1) + "K";
        } else {
          return number.toString();
        }
      }
  
      setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
      }, 2000);
  
      console.log(`${chalk.white.bold(`${dayjs().format('DD/MM/YYYY HH:mm:ss')}`)} - ${chalk.blue.bold(`Razor`)} => ${chalk.blue.bold(`Bot`)} - Sucessfully Enabled Status.`);
    },
  };