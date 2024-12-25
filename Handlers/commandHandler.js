const chalk = require('chalk');

async function loadCommands(client) {
    const { loadFiles } = require("../Functions/fileLoader");

    await client.commands.clear();

    const Files = await loadFiles("Commands");

    const commandsArray = Files.map((file) => {
        const command = require(file);
        client.commands.set(command.data.name, command);
        return command.data.toJSON();
    });

    await client.application.commands.set(commandsArray);

    const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
    console.log(`${timestamp} - ${chalk.blueBright("Razor")} => ${chalk.blue("Command")} - Loaded Slash Commands: ${commandsArray.length}`);
}

module.exports = { loadCommands };