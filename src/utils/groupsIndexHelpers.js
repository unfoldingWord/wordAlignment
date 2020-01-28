import { generateChapterGroupIndex } from './groupDataHelpers';

/**
 * Sorts either by chapter number, name, or id in that order
 * @param a - first item to compare
 * @param b - next item to compare
 * @return {number}
 */
export function sortIndex(a, b) {
  // if the id string contains chapter_ then remove it so that it doesnt mess up with the sorting
  // otherwise it'd leave it alone
  const A = a.id.includes('chapter_') ? parseInt(a.id.replace('chapter_', ''), 10) : (a.name || a.id).toLowerCase();
  const B = b.id.includes('chapter_') ? parseInt(b.id.replace('chapter_', ''), 10) : (b.name || b.id).toLowerCase();

  if (A < B) {
    return -1;
  }

  if (A > B) {
    return 1;
  }
  return 0;
}

/**
 * Loads the groups index from the global resources.
 * This is used primarily for generating the groups menu.
 * This is boiler plate to keep a separation of concerns between the global resources and projects.
 * TODO: the groups index should be copied into the project as part of {@link copyGroupDataToProject} and loaded from the project instead of the global resources.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool who's index will be loaded
 * @param {string} projectDir - path to the project directory
 * @param {function} translate - the locale function. TODO: refactor index loading so locale is not required
 * @return {*}
 */
export function loadProjectGroupIndex(translate) {
  return generateChapterGroupIndex(translate);
}
