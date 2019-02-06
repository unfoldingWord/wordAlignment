import _ from "lodash";
import {sortPanesSettings} from "../panesSettingsHelper";

let desiredPanes_ = null;

describe('paneSettingsHelper', () => {
  const setToolSettings_ = (toolname, setting, desiredPanes) => (setToolSettings(toolname, setting, desiredPanes));
  const paneSettings_ = [
    {
      languageId: 'targetLanguage',
      bibleId: 'targetBible'
    },
    {
      languageId: 'hbo',
      bibleId: 'uhb'
    },
    {
      languageId: 'grc',
      bibleId: 'ugnt'
    },
    {
      languageId: 'en',
      bibleId: 'ult'
    },
    {
      languageId: 'en',
      bibleId: 'ust'
    }
  ];

  describe('sortPanesSettings', () => {
    it('if empty adds target and greek OL', () => {
      const currentPaneSettings =[];
      const bibles = buildBible(currentPaneSettings);
      bibles.originalLanguage = {};
      bibles.originalLanguage.ugnt = {};
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(2);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('ugnt');
    });

    it('if empty adds target and hebrew OL', () => {
      const currentPaneSettings =[];
      const bibles = buildBible(currentPaneSettings);
      bibles.originalLanguage = {};
      bibles.originalLanguage.uhb = {};
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(2);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('uhb');
    });

    it('removes hbo', () => {
      const currentPaneSettings = _.cloneDeep(paneSettings_);
      const bibles = buildBible(currentPaneSettings);
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(4);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('ugnt');
    });

    it('adds target and OL', () => {
      const currentPaneSettings = _.cloneDeep(paneSettings_);
      const bibles = buildBible(currentPaneSettings.slice(3));
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(4);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('ugnt');
    });

    it('strips ust if not in bibles', () => {
      let bibles = _.cloneDeep(paneSettings_);
      bibles = buildBible(bibles.slice(0, 4));
      const currentPaneSettings = _.cloneDeep(paneSettings_);
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(3);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('ugnt');
    });

    it('moves targetBible and uhb to front', () => {
      const bibles = buildBible(_.cloneDeep(paneSettings_));
      const currentPaneSettings = _.cloneDeep(paneSettings_).reverse();
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(4);
      expect(desiredPanes_[0].bibleId).toEqual('targetBible');
      expect(desiredPanes_[1].bibleId).toEqual('uhb');
    });
  });
});

//
// helpers
//

function setToolSettings(toolname, setting, desiredPanes) {
  desiredPanes_ = _.cloneDeep(desiredPanes);
}

function buildBible(panes) {
  const bible = {};
  for (let pane of panes) {
    let languageSet = bible[pane.languageId];
    if (!languageSet) { // create language set if doesn't exist
      languageSet = {};
      bible[pane.languageId] = languageSet;
    }
    languageSet[pane.bibleId] = true;
  }
  return bible;
}
