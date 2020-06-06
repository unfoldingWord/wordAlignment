import usfmjs from 'usfm-js';

/**
 * Removes any USFM markers from a string.
 * @param {String} targetVerseText - verse text that may or may not contain USFM markers.
 * @returns {String} printable text from USFM.
 */
export const removeUsfmMarkers = (targetVerseText) => {
  const cleaned = usfmjs.removeMarker(targetVerseText);
  return cleaned;
};
