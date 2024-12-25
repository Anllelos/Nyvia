const chalk = require('chalk');

async function loadModals(client) {
  const { loadFiles } = require("../Functions/fileLoader");

  const Files = await loadFiles("Modals");
  
  Files.forEach((file) => {
    const modal = require(file);
    if (!modal.id) return;

    client.modals.set(modal.id, modal);
  });
  
  const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
  console.log(`${timestamp} - ${chalk.blueBright ("Razor")} => ${chalk.blackBright("Modal")} - Loaded Modals: ${Files.length}`);
}

module.exports = { loadModals };