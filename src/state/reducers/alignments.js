import Token from 'word-map/structures/Token';

import {
  ALIGN_SOURCE_TOKEN,
  ALIGN_TARGET_TOKEN,
  CLEAR_STATE,
  INSERT_ALIGNMENT,
  SET_CHAPTER_ALIGNMENTS,
  UNALIGN_SOURCE_TOKEN,
  UNALIGN_TARGET_TOKEN
} from '../actions/actionTypes';

/**
 * Checks if a word equals a token
 * @param {object} word
 * @param {Token} token
 * @return {boolean}
 */
const wordEqualsToken = (word, token) => {
  return word.word === token.toString()
    && word.occurrence === token.occurrence
    && word.occurrences === token.occurrences;
};

/**
 * Compares two words.
 * This is used for sorting
 * @param {object} a
 * @param {object} b
 * @return {number}
 */
const wordComparator = (a, b) => {
  if (a.position < b.position) {
    return -1;
  }
  if (a.position > b.position) {
    return 1;
  }
  return 0;
};

/**
 * Compares two alignments.
 * This is used for sorting
 * @param {object} a
 * @param {object} b
 * @return {number}
 */
const alignmentComparator = (a, b) => {
  if (a.topWords.length && b.topWords.length) {
    return wordComparator(a.topWords[0], b.topWords[0]);
  } else {
    return 0;
  }
};

const topWord = (token) => ({
  word: token.toString(),
  position: token.position,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  strong: token.strong,
  lemma: token.lemma,
  morph: token.morph
});

const bottomWord = (token) => ({
  word: token.toString(),
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  position: token.position
});

const alignment = (state = {topWords: [], bottomWords: []}, action) => {
  switch (action.type) {
    case ALIGN_TARGET_TOKEN:
      return {
        topWords: [...state.topWords],
        bottomWords: [
          ...state.bottomWords, bottomWord(action.token)
        ].sort(wordComparator)
      };
    case UNALIGN_TARGET_TOKEN:
      return {
        topWords: [...state.topWords],
        bottomWords: state.bottomWords.filter(word => {
          return !wordEqualsToken(word, action.token);
        })
      };
    case INSERT_ALIGNMENT:
    case ALIGN_SOURCE_TOKEN:
      return {
        topWords: [...state.topWords, topWord(action.token)].sort(
          wordComparator),
        bottomWords: [...state.bottomWords]
      };
    case UNALIGN_SOURCE_TOKEN:
      return {
        topWords: [
          ...state.topWords.filter(word => {
            return !wordEqualsToken(word, action.token);
          })],
        bottomWords: []
      };
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignment = action.alignments[vid].alignments[action.index];
      const sourceNgram = [];
      const targetNgram = [];
      for (const word of alignment.sourceNgram) {
        sourceNgram.push(word);
      }
      for (const word of alignment.targetNgram) {
        targetNgram.push(word);
      }
      return {
        sourceNgram,
        targetNgram
      };
    }
    default:
      return state;
  }
};

const verse = (state = [], action) => {
  switch (action.type) {
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const index = action.index;
      const nextState = [
        ...state
      ];
      nextState[index] = alignment(state[index], action);
      if (nextState[index].topWords.length === 0) {
        nextState.splice(index, 1);
      }
      return nextState;
    }
    case INSERT_ALIGNMENT:
      return [
        ...state,
        alignment(undefined, action)
      ].sort(alignmentComparator);
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignments = [];
      for (let i = 0; i < action.alignments[vid].alignments.length; i++) {
        alignments.push(alignment(state[i], {...action, index: i}));
      }
      return {
        source: {
          tokens: [...action.alignments[vid].sourceTokens],
          text: action.alignments[vid].sourceTokens.map(t => t.text).join(' ')
        },
        target: {
          tokens: [...action.alignments[vid].targetTokens],
          text: action.alignments[vid].targetTokens.map(t => t.text).join(' ')
        },
        alignments
      };
    }
    default:
      return state;
  }
};

const chapter = (state = {}, action) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: verse(state[vid], action)
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const verses = {};
      for (const vid of Object.keys(action.alignments)) {
        verses[vid] = verse(state[vid], {...action, verse: vid});
      }
      return verses;
    }
    default:
      return state;
  }
};

/**
 * Represents the alignment data.
 *
 * @param state
 * @param action
 * @return {*}
 */
const alignments = (state = {}, action) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case SET_CHAPTER_ALIGNMENTS:
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const cid = action.chapter + '';
      return {
        ...state,
        [cid]: chapter(state[cid], action)
      };
    }
    case CLEAR_STATE:
      return {};
    default:
      return state;
  }
};

export default alignments;

/**
 * Returns alignments for an entire chapter
 * @param state
 * @param {number} chapter - the chapter for which to return alignments
 * @return {{}}
 */
export const getChapterAlignments = (state, chapter) => {
  const chapterId = chapter + '';
  if (chapterId in state) {
    const alignments = {};
    for(const verseId of Object.keys(state[chapterId])) {
      alignments[verseId] = getVerseAlignments(state, chapterId, verseId);
    }
    return alignments;
  } else {
    return {};
  }
};

/**
 * Returns alignments for a single verse
 * @param state
 * @param {number} chapterNum
 * @param {number} verseNum
 * @return {[]}
 */
export const getVerseAlignments = (state, chapterNum, verseNum) => {
  const chapterId = chapterNum + '';
  const verseId = verseNum + '';
  if (chapterId in state) {
    const chapter = state[chapterId];
    if (verseId in chapter) {
      const verse = chapter[verseId];

      // join tokens to alignments
      const alignments = [];
      for (const a of verse.alignments) {
        const sourceNgram = [
          ...a.sourceNgram.map(pos => new Token(verse.source.tokens[pos]))
        ];
        const targetNgram = [
          ...a.targetNgram.map(pos => new Token(verse.target.tokens[pos]))
        ];
        alignments.push({
          sourceNgram,
          targetNgram
        });
      }
      return alignments;
    }
  }
  return [];
};

/**
 * Returns tokens that have been aligned to the verse
 * @param state
 * @param chapter
 * @param verse
 * @return {Token[]}
 */
export const getAlignedVerseTokens = (state, chapter, verse) => {
  const verseAlignments = getVerseAlignments(state, chapter, verse);
  const tokens = [];
  for (const alignment of verseAlignments) {
    for (const token of alignment.targetNgram) {
      tokens.push(token);
    }
  }
  return tokens;
};
