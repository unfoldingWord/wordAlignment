
export const sortPanesSettings = (currentPanes, setToolSettings, bibles) => {
  // filter out targetLanguage and OL
  let olBible = null;
  let panes = currentPanes.filter((pane) => {
    let filterOut = (pane.languageId === 'targetLanguage'); // strip target language which will be placed first
    if (!filterOut) {
      const isOL = ['bhp','ugnt','uhb'].includes(pane.bibleId);
      if (isOL) {  // strip OL which will be place second
        olBible = pane.bibleId;
        filterOut = isOL;
      }
    }
    return !filterOut;
  });

  let isOT = false;
  if (olBible) {
    isOT = (olBible === 'uhb');
  } else { // if no OL given, check in bibles
    isOT = bibles && bibles.originalLanguage && bibles.originalLanguage.uhb;
  }

  // filter out bibles that are not found in the resources reducer
  panes = panes.filter((paneSetting) => {
    return isPaneSettingFoundInBibles(bibles, paneSetting);
  });

  // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
  const desiredPanes = [
    {
      languageId: 'targetLanguage',
      bibleId: 'targetBible'
    },
    {
      languageId: 'originalLanguage',
      bibleId: isOT ? 'uhb' : 'ugnt'
    }
  ];

  // concat the remaining panes to the desiredPanes array
  if (panes.length > 0) {
    desiredPanes.push.apply(desiredPanes, panes);
  }

  setToolSettings('ScripturePane', 'currentPaneSettings', desiredPanes);
};

const isPaneSettingFoundInBibles = (bibles, paneSetting) => {
  return bibles[paneSetting.languageId] && bibles[paneSetting.languageId][paneSetting.bibleId] ? true : false;
};
