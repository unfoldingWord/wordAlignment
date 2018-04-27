import {combineReducers} from 'redux';
import {
  SET_TARGET_TOKENS,
  SET_SOURCE_TOKENS, CLEAR_STATE
} from '../actions/actionTypes';

const tokenComparator = (a, b) => {
  if (a.position < b.position) {
    return -1;
  }
  if (a.position > b.position) {
    return 1;
  }
  return 0;
};

/**
 * Formats a source token
 * @param {Token} token
 * @return {{}}
 */
const sourceToken = (token) => ({
  text: token.toString(),
  position: token.position,
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  strong: token.strong,
  lemma: token.lemma,
  morph: token.morph
});

/**
 * Formats a target token
 * @param {Token} token
 * @return {{}}
 */
const targetToken = (token) => ({
  text: token.toString(),
  occurrence: token.occurrence,
  occurrences: token.occurrences,
  position: token.position
});

const verse = (state = [], action) => {
  switch(action.type) {
    case SET_SOURCE_TOKENS: {
      const sortedTokens = action.tokens.sort(tokenComparator);
      const tokens = [];
      for(const token of sortedTokens) {
        tokens.push(sourceToken(token));
      }
      return tokens;
    }
    default:
      return state;
  }
};

const chapter = (state = {}, action) => {
  switch(action.type) {
    case SET_SOURCE_TOKENS: {
      const vid = action.verse + '';
      return {
        ...state,
        [vid]: verse(state[vid], action)
      };
    }
    default:
      return state;
  }
};

/**
 * Stores source tokens for the current verse
 * @param state
 * @param action
 * @return {Array}
 */
const sourceTokens = (state = {}, action) => {
  switch(action.type) {
    case SET_SOURCE_TOKENS: {
      const cid = action.chapter + '';
      return {
        ...state,
        [cid]: chapter(state[cid], action)
      };
    }
    case CLEAR_STATE:
      return [];
    default:
      return state;
  }
};

/**
 * Stores target tokens for the current verse
 * @param state
 * @param action
 * @return {Array}
 */
const targetTokens = (state = [], action) => {
  switch(action.type) {
    case SET_TARGET_TOKENS: {
      const sortedTokens = action.tokens.sort(tokenComparator);
      const targetTokens = [];
      for(const token of sortedTokens) {
        targetTokens.push(targetToken(token));
      }
      return targetTokens;
    }
    case CLEAR_STATE:
      return [];
    default:
      return state;
  }
};

export default combineReducers({
  source: sourceTokens,
  target: targetTokens
});

/**
 * Returns the source tokens for a verse
 * @param state
 * @param {number} chapter
 * @param {number} verse
 * @return {[]}
 */
export const getVerseSourceTokens = (state, chapter, verse) => {
  const tokens = getChapterSourceTokens(state, chapter);
  const vid = verse + '';
  if(tokens[vid]) {
    return tokens[vid];
  } else {
    return [];
  }
};

/**
 * Returns the source tokens for a chapter
 * @param state
 * @param {number} chapter
 * @return {*}
 */
export const getChapterSourceTokens = (state, chapter) => {
  console.error('you', chapter);
  const cid = chapter + '';
  if(state[cid]) {
    return state[cid];
  } else {
    return {};
  }
};
