const db = require('../../scripts/database');
const { escapeRegExp, escapeDiscord } = require('../../scripts/helper');

const cleanupGroups = async () => {
  let cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - 7);
  let cutOffDateInMilliseconds = cutOffDate.valueOf();

  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 1 } }, { multi: true })
  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 2 } }, { multi: true })
  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 3 } }, { multi: true })
}

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

    // Defer the response, which responds to the user saying the command is thinking.
    // This gives you more time then the default 3s to respond to an command.
    await interaction.defer();

    await cleanupGroups();

    if (!groupNameParam) {
      let groups = await db.groups.asyncFind({}, [['limit', 1000]])
      groups.sort((a, b) => b.members.length - a.members.length); // Sort my number of members

      if (groups.length === 0) {
        interaction.editReply(`There's no groups available.`);
        return;
      }
      
      let groupListMessage = 'Here\'s all the groups:\n';
  
      groups.forEach((group, index) => {
        let symbol = '👨‍👦';
        switch (index) {
          case 0:
            symbol = '🥇';
            break;
          case 1:
            symbol = '🥈';
            break;
          case 2:
            symbol = '🥉';
            break;
        }
        groupListMessage = groupListMessage + `\n> ${symbol} \`${group.members.length}\`: ${escapeDiscord(group.name)}`;
      });
  
      interaction.editReply(groupListMessage);
    } else {
      let { value: groupName } = groupNameParam;
      let groupNameRegex = new RegExp(`^${escapeRegExp(groupName)}`, 'i')
      let guild = client.guilds.cache.get(interaction.guildId)
  
      let group = await db.groups.asyncFindOne({ name: groupNameRegex });
      if (!group) {
        interaction.editReply(`The group _${escapeDiscord(groupName)}_ doesn't exist.`);
        return;
      }

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