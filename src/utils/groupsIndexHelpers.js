
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
