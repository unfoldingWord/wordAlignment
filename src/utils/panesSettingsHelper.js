
export const sortPanesSettings = (currentPanes, setToolSettings, bibles) => {
  // filter out targetLanguage and bhp/ugnt
  let panes = currentPanes.filter((pane) => {
    return pane.languageId !== 'targetLanguage' && pane.bibleId !== 'bhp' && pane.bibleId !== 'ugnt';
  });

  // filter out bibles that are not found in the resources reducer
  panes = panes.filter((paneSetting) => {
    return isPaneSettingFoundInBibles(bibles, paneSetting);
  });

  // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
  let desiredPanes = [
    {
      languageId: 'targetLanguage',
      bibleId: 'targetBible'
    },
    {
      languageId: 'originalLanguage',
      bibleId: 'ugnt'
    }
  ];

  // concat the remaining panes to the desiredPanes array
  if (panes.length > 0) {
    desiredPanes = desiredPanes.concat(panes);
  }

  setToolSettings('ScripturePane', 'currentPaneSettings', desiredPanes);
};

const isPaneSettingFoundInBibles = (bibles, paneSetting) => {
  return bibles[paneSetting.languageId] && bibles[paneSetting.languageId][paneSetting.bibleId] ? true : false;
};
