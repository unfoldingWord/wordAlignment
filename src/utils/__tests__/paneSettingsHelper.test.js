import _ from "lodash";
import {sortPanesSettings} from "../panesSettingsHelper";

let desiredPanes_ = null;

describe('paneSettingsHelper', () => {
  const setToolSettings_ = (toolname, setting, desiredPanes) => (setToolSettings(toolname, setting, desiredPanes));
  const bibles_ = [
    {
      languageId: 'targetLanguage',
      bibleId: 'any'
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
      bibleId: 'ulb'
    },
    {
      languageId: 'en',
      bibleId: 'ulb'
    }
  ];

  describe('sortPanesSettings', () => {
    it('removes targetLanguage', () => {
      const currentPaneSettings = _.cloneDeep(bibles_);
      const bibles = _.cloneDeep(bibles_);
      sortPanesSettings(currentPaneSettings, setToolSettings_ , bibles);
      expect(desiredPanes_.length).toEqual(4);
    });
  });
});

//
// helpers
//

function setToolSettings(toolname, setting, desiredPanes) {
  desiredPanes_ = _.cloneDeep(desiredPanes);
}