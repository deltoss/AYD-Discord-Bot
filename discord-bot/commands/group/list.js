const db = require('../../scripts/database');
const { escapeRegExp, escapeDiscord } = require('../../scripts/helper');
const { createPaginationCollectorAsync } = require('../../scripts/discord/pagination-helpers')
const {
  createFirstPageButton,
  createPrevPageButton,
  createNextPageButton,
  createLastPageButton
} = require('../../scripts/discord/pagination-buttons')

const cleanupGroupsAsync = async () => {
  let cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - 3);
  let cutOffDateInMilliseconds = cutOffDate.valueOf();

  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 1 } }, { multi: true })
  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 2 } }, { multi: true })
  await db.groups.asyncRemove({ createdAt: { $lt: cutOffDateInMilliseconds}, members: { $size: 3 } }, { multi: true })
}

const buildListGroupsMessageAsync = async (pageNo, itemsPerPage, noOfPages) => {
  let groups = await db.groups.asyncFind({}, [
    ['sort', { memberCount: -1 }],
    ['limit', itemsPerPage],
    ['skip', (pageNo - 1) * itemsPerPage]
  ])

  if (groups.length === 0)
    return `There's no groups available.`;

  let groupListMessage = 'Here\'s all the groups:\n';

  groups.forEach((group, index) => {
    let symbol = '👨‍👦‍👦';
    if (pageNo === 1) {
      if (index === 0)
        symbol = '🥇'
      else if (index === 1)
        symbol = '🥈'
      else if (index === 2)
        symbol = '🥉'
    }
    groupListMessage = groupListMessage + `\n> ${symbol} \`${group.memberCount}\`: ${escapeDiscord(group.name)}`;
  });

  groupListMessage = groupListMessage + `\n\n Page ${pageNo} of ${noOfPages}.`;
  return groupListMessage;
}

const listGroupsAsync = async (interaction) => {
  const itemsPerPage = 10;

  let paginationButtons = [
    createFirstPageButton(interaction).setDisabled(true),
    createPrevPageButton(interaction).setDisabled(true),
    createNextPageButton(interaction),
    createLastPageButton(interaction)
  ];
  let [firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn] = paginationButtons;

  const refreshPage = await createPaginationCollectorAsync(interaction, {
    firstPageButton: firstPageBtn,
    prevPageButton: prevPageBtn,
    nextPageButton: nextPageBtn,
    lastPageButton: lastPageBtn,
    noOfPages: async () => {
      let groupCount = await db.groups.asyncCount({});
      groupCount = groupCount || 1;
      return Math.ceil(groupCount / itemsPerPage);
    },
    paginationCallback: async (i, {
      pageNo,
      noOfPages,
      paginationRow,
      paginationType
    }) => {
      if (paginationType !== 'init')
        await i.deferUpdate();

      let messageOptions = {
        content: await buildListGroupsMessageAsync(pageNo, itemsPerPage, noOfPages),
        components: [paginationRow]
      };

      await i.editReply(messageOptions);
    },
  })

  refreshPage(interaction)
}

const buildListGroupMembersMessageAsync = async (group, interaction, pageNo, itemsPerPage, noOfPages) => {
  const offset = itemsPerPage * (pageNo - 1);
  const pagedMembers = group.members.slice(offset, offset + itemsPerPage);
  
  const { client } = interaction;
  let guild = client.guilds.cache.get(interaction.guildId)

  let groupMemberListMessage = `Here's all the members of _${escapeDiscord(group.name)}_:\n`;
  for (let i = 0; i < pagedMembers.length; i++) {
    let member = pagedMembers[i];
    let guildMember = await guild.members.fetch({ user: member.id, force: true });
    groupMemberListMessage = groupMemberListMessage + `\n> ${i + 1}. ${escapeDiscord(guildMember.displayName)}`;
  }

  groupMemberListMessage = groupMemberListMessage + `\n\n Page ${pageNo} of ${noOfPages}.`;
  return groupMemberListMessage;
}

const listGroupMembersAsync = async (interaction, groupName) => {
  let groupNameRegex = new RegExp(`^${escapeRegExp(groupName)}`, 'i')
  let group = await db.groups.asyncFindOne({ name: groupNameRegex });
  if (!group) {
    interaction.editReply(`The group _${escapeDiscord(groupName)}_ doesn't exist.`);
    return;
  }

  const itemsPerPage = 10;

  let paginationButtons = [
    createFirstPageButton(interaction).setDisabled(true),
    createPrevPageButton(interaction).setDisabled(true),
    createNextPageButton(interaction),
    createLastPageButton(interaction)
  ];
  let [firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn] = paginationButtons;

  const refreshPage = await createPaginationCollectorAsync(interaction, {
    firstPageButton: firstPageBtn,
    prevPageButton: prevPageBtn,
    nextPageButton: nextPageBtn,
    lastPageButton: lastPageBtn,
    noOfPages: Math.ceil(group.members.length / itemsPerPage),
    paginationCallback: async (i, {
      pageNo,
      noOfPages,
      paginationRow,
      paginationType
    }) => {
      if (paginationType !== 'init')
        await i.deferUpdate();

      let messageOptions = {
        content: await buildListGroupMembersMessageAsync(
          group, interaction, pageNo, itemsPerPage, noOfPages),
        components: [paginationRow]
      };

      await i.editReply(messageOptions);
    },
  })

  refreshPage(interaction)
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
    const groupNameParam = interaction.options.get('group_name');

    // Defer the response, which responds to the user saying the command is thinking.
    // This gives you more time then the default 3s to respond to an command.
    await interaction.defer();

    await cleanupGroupsAsync();

    if (!groupNameParam) {
      await listGroupsAsync(interaction);
    } else {
      let { value: groupName } = groupNameParam;
      await listGroupMembersAsync(interaction, groupName)
    }
  }
}