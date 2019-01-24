/**
 * Checks if two sets of alignment data are equivalent.
 *
 * @param {[]} prev - the previous set of tokenized alignment data
 * @param {[]} next - the next set of tokenized alignment data
 */
export function areAlignmentsEquivalent(prev, next) {
  const prevLength = prev.length;

  if (prevLength !== next.length) {
    console.error('Alignment length mismatch. You probably edited the source text.');
    return false;
  }

  for (let i = 0; i < prevLength; i++) {
    if (!compareAlignments(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two alignments to see if they are equivalent.
 * @param {object} prev - the previous version of the alignment
 * @param {object} next - the next version of the alignment
 * @returns {boolean}
 */
function compareAlignments(prev, next) {
  const prevTargetLength = prev.targetNgram.length;
  const prevSourceLength = prev.sourceNgram.length;

  if (prevTargetLength !== next.targetNgram.length) return false;
  if (prevSourceLength !== next.sourceNgram.length) return false;

  // compare target n-grams
  for (let i = 0; i < prevTargetLength; i++) {
    if (!compareTokens(prev.targetNgram[i], next.targetNgram[i])) {
      return false;
    }
  }

  // compare source n-grams
  for (let i = 0; i < prevSourceLength; i++) {
    if (!compareTokens(prev.sourceNgram[i], next.sourceNgram[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two tokens to see if they are similar enough to satisfy alignment equivalence.
 * @param {object} prev - the previous version of the token
 * @param {object} next - the next version of the token
 * @returns {boolean}
 */
function compareTokens(prev, next) {
  // TRICKY: this is in a separate function just in case we need additional logic.
  return prev.text === next.text;
}
