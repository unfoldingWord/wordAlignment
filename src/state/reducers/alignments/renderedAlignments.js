import _ from 'lodash';
import {Token} from 'wordmap-lexer';
import {
  ACCEPT_TOKEN_SUGGESTION,
  ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS,
  INSERT_RENDERED_ALIGNMENT,
  REMOVE_TOKEN_SUGGESTION,
  REPAIR_VERSE_ALIGNMENTS,
  RESET_VERSE_ALIGNMENT_SUGGESTIONS,
  RESET_VERSE_ALIGNMENTS,
  SET_ALIGNMENT_SUGGESTIONS,
  SET_CHAPTER_ALIGNMENTS
} from '../../actions/actionTypes';
import render, {convertToRendered} from './render';

/**
 * The renderedAlignments reducer
 * @param state
 * @param action
 * @param {object[]} alignments
 * @param {object[]} suggestions
 * @param {number} numSourceTokens
 * @return {Array}
 */
const renderedAlignments = (
  state = [], action, alignments = [], suggestions = [],
  numSourceTokens = 0) => {
  switch (action.type) {
    case ACCEPT_VERSE_ALIGNMENT_SUGGESTIONS:
    case INSERT_RENDERED_ALIGNMENT:
    case REMOVE_TOKEN_SUGGESTION:
    case ACCEPT_TOKEN_SUGGESTION:
    case SET_ALIGNMENT_SUGGESTIONS:
      return render(alignments, suggestions, numSourceTokens);
    case SET_CHAPTER_ALIGNMENTS:
    case RESET_VERSE_ALIGNMENT_SUGGESTIONS:
    case RESET_VERSE_ALIGNMENTS:
    case REPAIR_VERSE_ALIGNMENTS:
      return [...convertToRendered(alignments)];
    default:
      return state;
  }
};

export default renderedAlignments;

/**
 * Returns the tokenized rendered alignments
 * @param state
 * @param sourceTokens
 * @param targetTokens
 */
export const getTokenizedAlignments = (state, sourceTokens, targetTokens) => {
  const alignments = [];
  if (!state) {
    return [];
  }
  for (const rendered of state) {
    const a = {
      sourceNgram: rendered.sourceNgram.map(
        pos => new Token(_.cloneDeep(sourceTokens[pos]))),
      targetNgram: rendered.targetNgram.map(pos => {
        const config = _.cloneDeep(targetTokens[pos]);
        config.suggestion = isTokenSuggestion(rendered, config);
        return new Token(config);
      })
    };

    a.index = alignments.length;
    a.isSuggestion = !!rendered.suggestedTargetTokens;
    alignments.push(a);
  }
  return alignments;
};

/**
 * Checks if a token is a suggestion
 * @param renderedAlignment
 * @param token
 * @return {*|number[]|boolean}
 */
const isTokenSuggestion = (renderedAlignment, token) => {
  return renderedAlignment.suggestedTargetTokens !== undefined &&
    renderedAlignment.suggestedTargetTokens.indexOf(token.position) >= 0;
};
