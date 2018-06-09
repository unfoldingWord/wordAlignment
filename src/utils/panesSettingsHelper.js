
export const sortPanesSettings = (currentPanes, setToolSettings) => {
  // filter out targetLanguage and bhp/ugnt
  const panes = currentPanes.filter((pane) => {
    return pane.languageId !== 'targetLanguage' && pane.bibleId !== 'bhp' && pane.bibleId !== 'ugnt';
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
    console.log(desiredPanes);
  }

  setToolSettings('ScripturePane', 'currentPaneSettings', desiredPanes);
};
