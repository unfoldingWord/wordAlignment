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
 * Compares two numbers for sorting
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
const numberComparator = (a, b) => a - b;

/**
 * Compares two alignments for sorting
 * @param {object} a
 * @param {object} b
 * @return {number}
 */
const alignmentComparator = (a, b) => {
  if (a.sourceNgram.length && b.sourceNgram.length) {
    return numberComparator(a.sourceNgram[0], b.sourceNgram[0]);
  }
  return 0;
};

/**
 * Reduces a source token
 * @param token
 * @return {*}
 */
const reduceSourceToken = (token) => ({
  text: token.text,
  position: token.position,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  strong: token.strong,
  lemma: token.lemma,
  morph: token.morph
});

/**
 * Reduces a target token
 * @param token
 * @return {*}
 */
const reduceTargetToken = (token) => ({
  text: token.text,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  position: token.position
});

/**
 * Reduces the alignment state
 * @param state
 * @param action
 * @return {*}
 */
const reduceAlignment = (
  state = {sourceNgram: [], targetNgram: []}, action) => {
  switch (action.type) {
    case ALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: [...state.targetNgram, action.token.position].sort(
          numberComparator)
      };
    case UNALIGN_TARGET_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram],
        targetNgram: state.targetNgram.filter(position => {
          return position !== action.token.position;
        })
      };
    case INSERT_ALIGNMENT:
    case ALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: [...state.sourceNgram, action.token.position].sort(
          numberComparator),
        targetNgram: [...state.targetNgram]
      };
    case UNALIGN_SOURCE_TOKEN:
      return {
        sourceNgram: state.sourceNgram.filter(position => {
          return position !== action.token.position;
        }),
        targetNgram: []
      };
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignment = action.alignments[vid].alignments[action.index];
      const sourceNgram = [...alignment.sourceNgram];
      const targetNgram = [...alignment.targetNgram];
      return {
        sourceNgram: sourceNgram.sort(numberComparator),
        targetNgram: targetNgram.sort(numberComparator)
      };
    }
    default:
      return state;
  }
};

/**
 * Reduces the verse alignment state
 * @param state
 * @param action
 * @return {*}
 */
const reduceVerse = (state = [], action) => {
  switch (action.type) {
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const index = action.index;
      const newAlignments = [...state.alignments];
      newAlignments[index] = reduceAlignment(state.alignments[index], action);
      // TRICKY: remove empty alignments
      if (newAlignments[index].sourceNgram.length === 0) {
        newAlignments.splice(index, 1);
      }
      return {
        ...state,
        alignments: newAlignments
      };
    }
    case INSERT_ALIGNMENT:
      return {
        ...state,
        alignments: [
          ...state.alignments,
          reduceAlignment(undefined, action)
        ].sort(alignmentComparator)
      };
    case SET_CHAPTER_ALIGNMENTS: {
      const vid = action.verse + '';
      const alignments = [];
      for (let i = 0; i < action.alignments[vid].alignments.length; i++) {
        alignments.push(reduceAlignment(state[i], {...action, index: i}));
      }
      return {
        source: {
          tokens: action.alignments[vid].sourceTokens.map(reduceSourceToken),
          text: action.alignments[vid].sourceTokens.map(t => t.text).join(' ')
        },
        target: {
          tokens: action.alignments[vid].targetTokens.map(reduceTargetToken),
          text: action.alignments[vid].targetTokens.map(t => t.text).join(' ')
        },
        alignments
      };
    }
    default:
      return state;
  }
};

/**
 * Reduces the chapter alignment state
 * @param state
 * @param action
 * @return {*}
 */
const reduceChapter = (state = {}, action) => {
  switch (action.type) {
    case INSERT_ALIGNMENT:
    case UNALIGN_SOURCE_TOKEN:
    case ALIGN_SOURCE_TOKEN:
    case UNALIGN_TARGET_TOKEN:
    case ALIGN_TARGET_TOKEN: {
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: reduceVerse(state[vid], action)
      };
    }
    case SET_CHAPTER_ALIGNMENTS: {
      const verses = {};
      for (const vid of Object.keys(action.alignments)) {
        verses[vid] = reduceVerse(state[vid], {...action, verse: vid});
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
        [cid]: reduceChapter(state[cid], action)
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
    for (const verseId of Object.keys(state[chapterId])) {
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
