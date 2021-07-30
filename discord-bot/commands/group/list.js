const db = require('../../scripts/database');
const { escapeRegExp, escapeDiscord } = require('../../scripts/helper');

module.exports = {
  name: 'list',
  description: 'List all groups or members of a group.',
  options: [{
    name: 'group_name',
    type: 'STRING',
    description: 'The group to list members for. If omitted, lists all the groups.',
    required: false,
  }],
  executeAsync: async (interaction) => {
    const { client } = interaction;
    const groupNameParam = interaction.options.get('group_name');

    if (!groupNameParam) {
      let groups = await db.groups.asyncFind({}, [['sort', { name: 1 }], ['limit', 1000]])
  
      if (groups.length === 0) {
        interaction.reply(`There's no groups available.`);
        return;
      }
      
      let groupListMessage = 'Here\'s all the groups:\n';
  
      groups.forEach((group) => {
        groupListMessage = groupListMessage + `\n> ${escapeDiscord(group.name)}`;
      });
  
      interaction.reply(groupListMessage);
    } else {
      let { value: groupName } = groupNameParam;
      let groupNameRegex = new RegExp(`^${escapeRegExp(groupName)}`, 'i')
      let guild = client.guilds.cache.get(interaction.guildID)
  
      let group = await db.groups.asyncFindOne({ name: groupNameRegex });
      if (!group) {
        interaction.reply(`The group _${escapeDiscord(groupName)}_ doesn't exist.`);
        return;
      }

      // Defer the response, which responds to the user saying the command is thinking.
      // This gives you more time then the default 3s to respond to an command.
      await interaction.defer();

      let groupMemberListMessage = `Here's all the members of _${escapeDiscord(group.name)}_:\n`;
      for (let i = 0; i < group.members.length ; i++) {
        let member = group.members[i];
        let guildMember = await guild.members.fetch({ user: member.id, force: true });
        groupMemberListMessage = groupMemberListMessage + `\n> ${i + 1}. ${escapeDiscord(guildMember.displayName)}`;
      }
  
      interaction.editReply(groupMemberListMessage);
    }
  }
}