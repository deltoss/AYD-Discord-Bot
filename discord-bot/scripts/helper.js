const { Util } = require('discord.js')

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function escapeDiscord(text) {
  text = Util.removeMentions(text);
  text = Util.escapeMarkdown(text);
  return text;
}

module.exports = {
  escapeRegExp,
  escapeDiscord
};