/**
 * Returns the class name for a given target language font.
 * @param {string} languageFont - User selected font for target Language.
 */
export function getFontClassName(languageFont) {
  return languageFont && languageFont !== 'default' ? `${languageFont}-text` : '';
}
