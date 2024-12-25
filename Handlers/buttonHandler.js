const chalk = require('chalk');
const { loadFiles } = require("../Functions/fileLoader");

async function loadButtons(client) {
  const Files = await loadFiles("Buttons");
  let buttonCount = 0;

  Files.forEach((file) => {
    const button = require(file);
    if (!button.id) return;

    client.buttons.set(button.id, button);
    buttonCount++;
  });

  const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
  console.log(`${timestamp} - ${chalk.blueBright("Razor")} => ${chalk.redBright("Buttons")} - Loaded: ${buttonCount}`);
}

module.exports = { loadButtons };