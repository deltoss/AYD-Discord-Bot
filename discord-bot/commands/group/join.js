const db = require('../../scripts/database');
const { escapeRegExp, escapeDiscord } = require('../../scripts/helper');

module.exports = {
  name: 'join',
  description: 'Join a group.',
  options: [{
    name: 'group_name',
    type: 'STRING',
    description: 'The group to join.',
    required: true,
  }],
  executeAsync: async (interaction) => {
    let { value: groupName } = interaction.options.get('group_name');
    let groupNameRegex = new RegExp(`^${escapeRegExp(groupName)}`, 'i')
    let user = {
      id: interaction.user.id,
      system: interaction.user.system,
      username: interaction.user.username,
      bot: interaction.user.bot,
      tag: interaction.user.tag,
    };
  
    let group = await db.groups.asyncFindOne({ name: groupNameRegex });
    if (group) {
      let alreadyAMember = group.members.some((member) => {
        return member.id === user.id;
      });
      if (alreadyAMember) {
        interaction.reply(`You're already a member of _${escapeDiscord(group.name)}_!`);
        return;
      }
  
      await db.groups.asyncUpdate({ _id: group._id }, {
        $push: { members: user },
        $set: { memberCount: group.members.length + 1 }
      }, {});
      interaction.reply(`You have joined the group _${escapeDiscord(group.name)}_!`);
    } else {
      await db.groups.asyncInsert({
        name: groupName,
        createdAt: Date.now(),
        members: [user],
        memberCount: 1
      });
      interaction.reply(`You have created a new group _${escapeDiscord(groupName)}_!\n`
        + `\n> Important ⚠`
        + `\n> `
        + `\n> If you don't have 4 members or more by 3 days time, your group will be automatically disbanded & deleted.`
      );
    }
  }
}
