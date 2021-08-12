const { MessageButton } = require('discord.js');

const createFirstPageButton = (interaction) => {
  return new MessageButton()
      // Set a unique custom ID using the interaction ID,
      // so collectors doesn't conflict on handling interactions
      // from the same command from other users or the same user.
      .setCustomId(`first-${interaction.id}`)
      .setLabel('⏮')
      .setStyle('SECONDARY')
}

const createPrevPageButton = (interaction) => {
  return new MessageButton()
      .setCustomId(`prev-${interaction.id}`)
      .setLabel('◀')
      .setStyle('SECONDARY')
}

const createNextPageButton = (interaction) => {
  return new MessageButton()
      .setCustomId(`next-${interaction.id}`)
      .setLabel('▶')
      .setStyle('SECONDARY')
}

const createLastPageButton = (interaction) => {
  return new MessageButton()
      .setCustomId(`last-${interaction.id}`)
      .setLabel('⏭')
      .setStyle('SECONDARY')
}

module.exports = {
    createFirstPageButton,
    createPrevPageButton,
    createNextPageButton,
    createLastPageButton
}