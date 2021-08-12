const { MessageActionRow } = require('discord.js');

const createPaginationCollectorAsync = async (interaction, {
  firstPageButton,
  prevPageButton,
  nextPageButton,
  lastPageButton,
  paginationCallback,
  noOfPages
}) => {
  let pageNo = 1;
  // Filter, so it doesn't affect other non-related interactions or messages.
  const filter = i => {
    let correctButtonId = i.customId === firstPageButton.customId ||
      i.customId === prevPageButton.customId ||
      i.customId === nextPageButton.customId ||
      i.customId === lastPageButton.customId
    if (!correctButtonId)
      return false;

    // Checks if the user who clicked the button
    // is the same user who originally used the command.
    if (i.message.interaction.user.id !== i.user.id) {
      i.reply({
        content: `These buttons aren't for you!`,
        ephemeral: true
      });
      return false;
    }
    return true;
  };

  // Handle when the user clicks on the button.
  const collector = await interaction.channel.createMessageComponentCollector({
    filter
  });

  const refreshPage = async i => {
    let paginationType = null;
    const prevPageNo = pageNo;
    switch (i.customId) {
      case firstPageButton.customId:
        pageNo = 1;
        paginationType = 'first';
        break;
      case prevPageButton.customId:
        pageNo--;
        paginationType = 'prev';
        break;
      case nextPageButton.customId:
        pageNo++;
        paginationType = 'next';
        break;
      case lastPageButton.customId:
        // We set pageNo later, after calculating it
        paginationType = 'last';
        break;
      case undefined:
        // Represents the case where you manually refresh the pagination.
        // Usually triggered to get the first page when the message is first created.
        paginationType = 'init';
        break;
    }

    // Perform callback if noOfPages is a function. Note that it can be a:
    // - Callback function, returning the number of pages
    // - Callback function, returning a promise that resolves to the number of pages
    // - Callback async function, returning the number of pages.
    let calculatedNoOfPages = noOfPages;
    if (typeof calculatedNoOfPages === 'function') {
      calculatedNoOfPages = calculatedNoOfPages(i, {
        currentPageNo: pageNo,
        paginationType
      });
      // If it's a async function that returns a promise,
      // we await that promise and get the result.
      if (calculatedNoOfPages && typeof calculatedNoOfPages.then === 'function')
        calculatedNoOfPages = await calculatedNoOfPages;
    }

    if (i.customId === lastPageButton.customId)
      pageNo = calculatedNoOfPages;

    firstPageButton.setDisabled(true);
    prevPageButton.setDisabled(true);
    nextPageButton.setDisabled(true);
    lastPageButton.setDisabled(true);
    if (pageNo > 1) {
      firstPageButton.setDisabled(false);
      prevPageButton.setDisabled(false);
    }
    if (!calculatedNoOfPages || pageNo < calculatedNoOfPages) {
      nextPageButton.setDisabled(false);
      lastPageButton.setDisabled(false);
    }

    const paginationRow = new MessageActionRow();
    paginationRow.addComponents(firstPageButton,
      prevPageButton,
      nextPageButton,
      lastPageButton);

    let paginationCallbackResponse = paginationCallback(i, {
      prevPageNo,
      pageNo,
      noOfPages: calculatedNoOfPages,
      paginationRow,
      paginationType
    });
    if (paginationCallbackResponse && typeof paginationCallbackResponse.then === 'function')
      paginationCallbackResponse = await paginationCallbackResponse;
  };

  collector.on('collect', refreshPage);
  return refreshPage;
}

module.exports = {
  createPaginationCollectorAsync
}