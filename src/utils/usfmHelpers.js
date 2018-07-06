import usfmjs from 'usfm-js';

export const removeUsfmMarkers = (targetVerseText) => {
  const cleaned = usfmjs.removeMarker(
    targetVerseText,
    ['f', 'q(\\d)?', 's(\\d)?', 'p(\\d)?']
  ); // remove these markers, 'f' is predefined

  const regString = '\\\\\\w[0-9]*';
  const regex = new RegExp(regString, 'g');
  return cleaned.replace(regex, '');
};
