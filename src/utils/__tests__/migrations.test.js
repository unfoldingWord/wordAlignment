import {Token} from 'wordmap-lexer';
import {formatAlignmentData, normalizeAlignmentData} from '../migrations';

describe('alignment data migration', () => {
  it('migrates legacy (2017) alignment data', () => {
    const data = {
      '1': {
        alignments: [
          {
            topWords: [
              {
                'word': 'ὁ',
                'strong': 'G35880',
                'lemma': 'ὁ',
                'morph': 'Gr,EA,,,,NMS,',
                'occurrence': 1,
                'occurrences': 1
              }],
            bottomWords: [
              {
                'word': 'Mẽ',
                'occurrence': 1,
                'occurrences': 2,
                'type': 'bottomWord'
              }]
          }],
        wordBank: [
          {
            'word': 'vlẽ',
            'occurrence': 1,
            'occurrences': 1,
            'type': 'bottomWord'
          }]
      }
    };
    const output = formatAlignmentData(data);
    expect(output).toEqual({
      '1': {
        sourceTokens: [
          {
            'text': 'ὁ',
            'strong': 'G35880',
            'lemma': 'ὁ',
            'morph': 'Gr,EA,,,,NMS,',
            'occurrence': 1,
            'occurrences': 1
          }],
        targetTokens: [
          {
            'text': 'Mẽ',
            'occurrence': 1,
            'occurrences': 2
          },
          {
            'text': 'vlẽ',
            'occurrence': 1,
            'occurrences': 1
          }],
        alignments: [
          {
            sourceNgram: [
              {
                'text': 'ὁ',
                'strong': 'G35880',
                'lemma': 'ὁ',
                'morph': 'Gr,EA,,,,NMS,',
                'occurrence': 1,
                'occurrences': 1
              }],
            targetNgram: [
              {
                'text': 'Mẽ',
                'occurrence': 1,
                'occurrences': 2
              }]
          }]
      }
    });
  });

  it('normalizes migrated (2017) alignment data', () => {
    const data = {
      '1': {
        sourceTokens: [
          {
            'text': 'ὁ',
            'strong': 'G35880',
            'lemma': 'ὁ',
            'morph': 'Gr,EA,,,,NMS,',
            'occurrence': 1,
            'occurrences': 1
          }],
        targetTokens: [
          {
            'text': 'Mẽ',
            'occurrence': 1,
            'occurrences': 1
          },
          {
            'text': 'vlẽ',
            'occurrence': 1,
            'occurrences': 1
          }],
        alignments: [
          {
            sourceNgram: [
              {
                'text': 'ὁ',
                'strong': 'G35880',
                'lemma': 'ὁ',
                'morph': 'Gr,EA,,,,NMS,',
                'occurrence': 1,
                'occurrences': 1
              }],
            targetNgram: [
              {
                'text': 'vlẽ',
                'occurrence': 1,
                'occurrences': 1
              },
              // TRICKY: this is out of order
              {
                'text': 'Mẽ',
                'occurrence': 1,
                'occurrences': 1
              }]
          }]
      }
    };
    const sourceTokens = {
      '1': [
        new Token({
          text: 'ὁ',
          occurrence: 1,
          occurrences: 1,
          position: 0
        })]
    };
    const targetTokens = {
      '1': [
        new Token({
          text: 'Mẽ',
          occurrence: 1,
          occurrences: 1,
          position: 0
        }),
        new Token({
          text: 'vlẽ',
          occurrence: 1,
          occurrences: 1,
          position: 1
        })
      ]
    };
    const output = normalizeAlignmentData(data, sourceTokens, targetTokens);
    expect(output).toEqual({
      '1': {
        sourceTokens: [
          {
            text: 'ὁ',
            strong: 'G35880',
            lemma: 'ὁ',
            morph: 'Gr,EA,,,,NMS,',
            occurrence: 1,
            occurrences: 1,
            position: 0
          }],
        targetTokens: [
          {
            text: 'Mẽ',
            occurrence: 1,
            occurrences: 1,
            position: 0
          },
          {
            text: 'vlẽ',
            occurrence: 1,
            occurrences: 1,
            position: 1
          }],
        alignments: [
          {
            sourceNgram: [0],
            targetNgram: [0, 1]
          }]
      }
    });
  });
});
