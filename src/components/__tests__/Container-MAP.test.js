import {generateMAP, getPredictions} from '../Container';

describe('word MAP integration', () => {
  const targetBook = {
    '1': {
      '1': {},
      '2': {}
    },
    '2': {
      '1': {}
    }
  };
  const state = {
    tool: {
      alignments: {
        '1': {
          '1': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'hello',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'olleh',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          },
          '2': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'world',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'dlrow',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          }
        },
        '2': {
          '1': {
            alignments: [
              {
                sourceNgram: [0],
                targetNgram: [0]
              }],
            sourceTokens: [
              {
                text: 'foo',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }],
            targetTokens: [
              {
                text: 'oof',
                occurrence: 1,
                occurrences: 1,
                position: 0
              }]
          }
        }
      }
    }
  };

  it('creates a map', () => {
    const currentVerse = 1;
    const currentChapter = 1;
    return generateMAP(targetBook, state, currentChapter, currentVerse).
      then(map => {
        expect(map.engine.corpusIndex.staticIndex.srcCharLength).toEqual(0);
        expect(map.engine.corpusIndex.staticIndex.tgtCharLength).toEqual(0);
        expect(Object.keys(
          map.engine.alignmentMemoryIndex.permutationIndex.alignPermFreqIndex.index).length >
          0).toBeTruthy();
      });
  });

  it('makes predictions', () => {
    const currentVerse = 1;
    const currentChapter = 1;
    const sourceText = 'the world';
    const targetText = 'eht dlrow';
    return generateMAP(targetBook, state, currentChapter, currentVerse).
      then(map => getPredictions(map, sourceText, targetText)).
      then(predictions => {
        expect(predictions.length > 0).toBeTruthy();
      });
  });
});
