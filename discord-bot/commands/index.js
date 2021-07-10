const fs = require('fs');

const commands = {};
const commandFiles = fs.readdirSync(__dirname).filter(file => 
  file.endsWith('.js') && !file.endsWith('index.js'));
for (const file of commandFiles) {
  const command = require(`./${file}`);
  commands[command.name] = command;
}

const commandFolders = fs.readdirSync(__dirname).filter(file => !file.endsWith('.js'));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`${__dirname}/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./${folder}/${file}`);
    command.category = folder;
    commands[command.name] = command;
  }
}

const handleCommandAsync = async (interaction) => {
  // check if command exists
  const command = commands[interaction.commandName];
  if (!command) return;

  // call the command
  try {
    await command.executeAsync(interaction);
  } catch (e) {
    // something wrong, this stops the command crashing the app
    console.error(e);
    interaction.reply('there was an error trying to execute that command!');
  }
};

module.exports = { handleCommandAsync, commands };
