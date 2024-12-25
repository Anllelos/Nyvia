const chalk = require('chalk');

async function loadEvents(client) {
  const { loadFiles } = require("../Functions/fileLoader");

  await client.events.clear();

  const Files = await loadFiles("Events");

  Files.forEach((file) => {
    const event = require(file);

    const execute = (...args) => event.execute(...args, client);
    client.events.set(event.name, execute);    

    if (event.rest) {
      if (event.once)
        client.rest.once(event.name, execute);
      else
        client.rest.on(event.name, execute);
    } else {
      if (event.once)
        client.once(event.name, execute);
      else client.on(event.name, execute);
    }
  })

  const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
  console.log(`${timestamp} - ${chalk.blueBright("Razor")} => ${chalk.magentaBright("Event")} - Loaded Events: ${Files.length}`);
}

module.exports = { loadEvents };