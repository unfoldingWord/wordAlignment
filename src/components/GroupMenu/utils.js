/**
 * Helper utility to generate data for the menu.
 * @param {[]} index - the group index
 * @param {object} data - the group data
 * @param {string} progressKey - the key by which the group progress will be measured
 * @param {function} [onProcessItem=null] - an optional callback to perform additional processing on a menu item. This is executed before the `progressKey` is evaluated.
 * @returns {[]} the menu data
 */
export function generateMenuData(
  index,
  data,
  progressKey,
  onProcessItem = null
) {
  const menu = [];

  for (let i = 0, len = index.length; i < len; i++) {
    if (Object.keys(data).includes(index[i].id)) {
      // generate menu group
      const children = data[index[i].id].map(item => {
        return generateMenuItem(item, onProcessItem);
      });
      menu.push({
        title: index[i].name,
        progress: calculateProgress(children, progressKey),
        id: index[i].id,
        children
      });
    }
  }

  return menu;
}



/**
 * Produces a valid menu item from a context id or a group data entry.
 * This is useful for pre-processing the active entry.
 * @param {object} contextId - a context id or group data entry.
 * @param {function} [onProcessItem=null] - an optional preprocessor
 * @returns {object}
 */
export function generateMenuItem(contextId, onProcessItem = null) {
  // TRICKY: determine if this is a contextId or group data entry.
  let item;
  if(contextId.hasOwnProperty("contextId")) {
    item = contextId;
  } else {
    item = {contextId};
  }

  // perform pre-processing
  if(typeof onProcessItem === "function") {
    return onProcessItem(processMenuItem(item));
  } else {
    return processMenuItem(item);
  }
}

/**
 * Calculates the progress over an array of objects
 * @param {object[]} data - an array of objects
 * @param {*} progressKey - the key used to check the completion status of each object
 * @returns {number} - returns a number between 0 and 100 inclusive
 */
function calculateProgress(data, progressKey) {
  const total = data.length;
  let completed = 0;
  for (let i = 0, len = data.length; i < len; i ++) {
    if (data[i][progressKey]) {
      completed++;
    }
  }
  return (completed / total) * 100;
}

/**
 * Performs some default child generation operations.
 * For advanced menu item customization you should provide a callback to {@link generateMenuData}
 * @param {object} data - the menu item data
 * @returns {object} - the formatted menu item data
 */
function processMenuItem(data) {
  // TRICKY: use the context id to pre-populate some fields
  const {
    contextId: {
      groupId,
      reference: { bookId, chapter, verse }
    }
  } = data;
  const passageTitle = `${bookId} ${chapter}:${verse}`;

  return {
    ...data,
    groupId,
    itemId: passageTitle,
    title: passageTitle
  };
}
