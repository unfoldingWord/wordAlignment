/**
 * Returns the class name for a given target language project font.
 * @param {string} projectFont - User selected font for target Language project.
 */
export function getFontClassName(projectFont) {
  return projectFont && projectFont !== 'default' ? `${projectFont}-text` : '';
}
