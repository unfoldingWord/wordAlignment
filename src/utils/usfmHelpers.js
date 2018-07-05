
export const removeUsfmMarkers = (targetVerseText) => {
  const regString = '\\\\\\w[0-9]*';
  const regex = new RegExp(regString, 'g');
  return targetVerseText.replace(regex, '');
};
