import {combineReducers} from 'redux';
import {
  SET_TARGET_TOKENS,
  SET_SOURCE_TOKENS
} from '../../actions/actionTypes';

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

/**
 * Stores source tokens for the current verse
 * @param state
 * @param action
 * @return {Array}
 */
const sourceTokens = (state = [], action) => {
  switch(action.type) {
    case SET_SOURCE_TOKENS: {
      const sortedTokens = action.tokens.sort(tokenComparator);
      const sourceTokens = [];
      for(const token of sortedTokens) {
        sourceTokens.push(sourceToken(token));
      }
      return sourceTokens;
    }
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
    default:
      return state;
  }
};

export default combineReducers({
  source: sourceTokens,
  target: targetTokens
});
