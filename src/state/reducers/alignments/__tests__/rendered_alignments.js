import {getTokenizedAlignments} from '../renderedAlignments';

describe('get tokenzied alignments', () => {
  it('tokenizes an alignment', () => {
    const state = [
      {
        sourceNgram: [0],
        targetNgram: [0]
      }
    ];
    const source = [{
      text: 'hello'
    }];
    const target = [{
      text: 'world'
    }];
    const expected = [
      {
        index: 0,
        isSuggestion: false,
        sourceNgram: [{
          index: 0,
          occurrence: 1,
          occurrences: 1,
          text: 'hello'
        }],
        targetNgram: [{
          index: 0,
          occurrence: 1,
          occurrences: 1,
          text: 'world'
        }]
      }
    ];
    const result = getTokenizedAlignments(state, source, target);
    expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
  });

  it('tokenizes a suggestion', () => {
    const state = [
      {
        suggestedTargetTokens: [0],
        sourceNgram: [0],
        targetNgram: [0]
      }
    ];
    const source = [{
      text: 'hello'
    }];
    const target = [{
      text: 'world'
    }];
    const expected = [
      {
        index: 0,
        isSuggestion: true,
        sourceNgram: [{
          index: 0,
          occurrence: 1,
          occurrences: 1,
          text: 'hello'
        }],
        targetNgram: [{
          index: 0,
          occurrence: 1,
          occurrences: 1,
          text: 'world'
        }]
      }
    ];
    const result = getTokenizedAlignments(state, source, target);
    expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
  });
});
