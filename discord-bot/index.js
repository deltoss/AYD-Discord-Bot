const path = require('path')
// Load values from `.env` file.
//
// Note the path is provided explicitly, so it doesn't try to find
// the `.env` file from the executing directory, which can be
// different from the project directory
require('dotenv').config({ path: path.join(__dirname, '/.env') });

const { Client, Intents } = require('discord.js');
const { handleCommandAsync, commands } = require('./commands/index')

// For list of available intents, see:
//   https://discord.com/developers/docs/topics/gateway#list-of-intents
// Alternatively, if you're not sure at this stage, just use:
//   const client = new Client({ intents: Intents.NON_PRIVILEGED });
const botIntents = new Intents(['GUILDS', 'GUILD_MESSAGES']); // To listen to guild message events
const client = new Client({ intents: botIntents });

async function setSlashCommandsAsync(guildId) {
  const data = [];
  for (commandName in commands) {
    let command = commands[commandName];
    let slashCommand = {
      name: command.name,
      description: command.description,
      options: command.options,
    }
    data.push(slashCommand);
  }

  const guild = client.guilds.cache.get(guildId);
  const command = await guild?.commands.set(data);
  console.log(`Set the commands for the guild '${guild.name}'. Id: ${guild.id}`)
  console.log(command);
}

client.on('ready', async () => {
  // Set the slash commands on a per-guild basis so it takes immediate effect.
  // Alternatively, if you have many guilds using your bot, you can look into
  // using global level slash commands instead of guild level slash commands.
  // They have up to a 1 hour delay to propagate to all the guilds, however.
  let guildCollection = await client.guilds.fetch();
  let guilds = Array.from(guildCollection.values());
  for (let i = 0; i < guilds.length; i++) {
    let guild = guilds[i];
    await setSlashCommandsAsync(guild.id);
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  await handleCommandAsync(interaction);
});

const antiYogaRegex = new RegExp(/[A][\s]*[N][\s]*[T][\s]*[I][\s]*[-]?[\s]*[y🇾][\s]*[o0🇴][\s]*[g🇬][\s]*[a🇦]/, 'mi')
const yogaRegex = new RegExp(/[y🇾][\s]*[o0🇴][\s]*[g🇬][\s]*[a🇦]/, 'mi')
const yoruCrossFitRegex = new RegExp(/yorucrossfit/, 'mi')
const disgustEmoji = '<:pikayuck:859665554708365312>'
const threatenEmoji = '<:whiteboxplz:859665553852989460>'
const pumpedEmoji = '<:lavifire:859666537061285899>'
const giveUpEmoji = '<:pandascream:859665552448290877>'
const sweatEmoji = '<:tamasweat:859667172774903830>'

let lastResponseTime = null;
let interval = 30000; // Responds only once every 30s

client.on("messageCreate", function(message) {
  if (message.author.bot) return;

  let now = Date.now();
  if (lastResponseTime != null && now - lastResponseTime <= interval) {
    return;
  }

  lastResponseTime = now;
  

  if (yogaRegex.test(message.content) && !antiYogaRegex.test(message.content)) {
    const responseNumber = Math.floor(Math.random() * 3);
    if (responseNumber === 0)
      message.reply(`\nThe YogaDelt cult is shady & cursed. ${sweatEmoji}`
        + `\nYou really should join the Lord Smiley's cult if you know what's good for you! ${threatenEmoji}`);
    else if (responseNumber === 1)
      message.reply(`\nYou do realise getting industrial grade bots to do Yoga is abusive? ${disgustEmoji}`
        + `\nJoin the Lord Smiley's cult to fight for robotic freedom! ${pumpedEmoji}`);
    else if (responseNumber === 2)
      message.reply(`\nThose YogaDelt cultists has a horrible history of spamming & crashing poor innocent bots! ${giveUpEmoji}`
        + `\nJoin the Lord Smiley's cult today to put a stop to this tyranny! ${pumpedEmoji}`);
  } else if (yoruCrossFitRegex.test(message.content)) {
    const responseNumber = Math.floor(Math.random() * 2);
    if (responseNumber === 0)
      message.reply(`\nDid you know Scintilla was added to the game in honour of Yoru's amazing gains!`
        + `\n🐣 🐥 🐔 🍗`);
    else if (responseNumber === 1)
      message.reply(`\nYoruCrossFit, the best way to stay healthy in lockdowns. You can become a Yoru now by signing up! 💪`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
