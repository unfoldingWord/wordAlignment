import usfmjs from 'usfm-js';

/**
 * Removes any usfm markers from a string.
 * @param {String} targetVerseText - verse text that may or may not contain usfm markers.
 * @returns {String} cleaned or parsed string.
 */
export const removeUsfmMarkers = (targetVerseText) => {
  // remove \pi marker
  targetVerseText = targetVerseText.replace(/\\pi/g, '');
  // remove footnotes
  const cleaned = usfmjs.removeMarker(
    targetVerseText,
    ['f', 'q(\\d)?', 's(\\d)?', 'p(\\d)?']
  ); // remove these markers, 'f' is predefined

  // remove any other usfm marker
  const regString = '\\\\\\w[0-9]*';
  const regex = new RegExp(regString, 'g');
  return cleaned.replace(regex, '');
};
