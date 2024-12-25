const chalk = require('chalk');
const fs = require("fs");

function prefixCommands(client) {
  const commandFolder = fs.readdirSync("./pCommands");
  let commandCount = 0;

  for (const folder of commandFolder) {
    const commands = fs
      .readdirSync(`./pCommands/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of commands) {
      const command = require(`../pCommands/${folder}/${file}`);

      if (command.name) {
        client.pcommands.set(command.name, command);
        commandCount++;

        if (command.aliases && Array.isArray(command.aliases)) {
          command.aliases.forEach((alias) => {
            client.aliases.set(alias, command.name);
          });
        }
      }
    }
  }

  const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
  console.log(`${timestamp} - ${chalk.blueBright("Razor")} => ${chalk.yellowBright("Prefix Commands")} - Loaded: ${commandCount}`);
}

module.exports = { prefixCommands };