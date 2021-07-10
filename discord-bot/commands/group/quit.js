const db = require('../../scripts/database');
const { escapeRegExp, escapeDiscord } = require('../../scripts/helper');

module.exports = {
  name: 'quit',
  description: 'Quit a group.',
  options: [{
    name: 'group_name',
    type: 'STRING',
    description: 'The group to quit.',
    required: true,
  }],
  executeAsync: async (interaction) => {
    let { value: groupName } = interaction.options.get('group_name');
    let groupNameRegex = new RegExp(`^${escapeRegExp(groupName)}`, 'i')
  
    let group = await db.groups.asyncFindOne({ name: groupNameRegex });
    if (group) {
      let alreadyAMember = group.members.some((member) => {
        return member.id === interaction.user.id;
      });
      if (!alreadyAMember) {
        interaction.reply(`You're not a member of _${escapeDiscord(group.name)}_!`);
        return;
      }
  
      if (group.members.length > 1) {
        await db.groups.asyncUpdate({ _id: group._id }, { $pull: { members: { id: interaction.user.id } } }, {});
        interaction.reply(`You have quit the group _${escapeDiscord(group.name)}_!`);
      } else {
        await db.groups.asyncRemove({ _id: group._id }, {});
        interaction.reply(`You have quit the group _${escapeDiscord(group.name)}_! As the group has no other members, it has been deleted.`);
      }
    } else {
      interaction.reply(`The group _${escapeDiscord(groupName)}_ doesn't exist.`);
    }
  }
}

