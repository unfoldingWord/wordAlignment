import * as lexiconHelpers from '../lexicon';

describe('lexiconHelpers', () => {
  const strongsTests = [
    ['b:H7225', 7225, 'uhl'],
    ['c:d:H0776', 776, 'uhl'],
    ['H1961', 1961, 'uhl'],
    ['H5921a', 5921, 'uhl'],
    ['G33260', 3326, 'ugl']
  ];

  for (let test of strongsTests) {
    const strongs = test[0];
    const expectedEntryId = test[1];
    const expectedLexiconId = test[2];


    it('should succeed with "' + strongs + '"', () => {
      //when
      const results = extractStrongs(strongs);

      // then
      expect(results.entryId).toEqual(expectedEntryId);
      expect(results.lexiconId).toEqual(expectedLexiconId);
    });
  }
});

//
// helpers
//

function extractStrongs(strongs) {
  const strongs_ = lexiconHelpers.findStrongs(strongs);
  const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strongs_);
  const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strongs_);
  return {entryId, lexiconId};
}
