import path from "path-extra";

/**
 * generates path to check data for verse
 * @param {String} checkType (e.g. reminders)
 * @param {String} bookId
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @return {string}
 */
export function generateCheckPath(checkType, bookId, chapter, verse) {
  const dataPath = path.join('checkData', checkType, bookId, chapter + '', verse + '');
  return dataPath;
}

/**
 * @description loads checkdata based on given contextId.
 * @param {String} checkType (e.g. reminders)
 * @param {String|Number} chapter
 * @param {String|Number} verse
 * @param {Object} api - tool api for system calls
 * @param {String} toolName
 * @return {Object} returns the most recent object for verse loaded from the file system.
 */
export function loadCheckData(api, checkType, chapter, verse,
                              toolName = 'wordAlignment') {
  const {
    projectDataPathExistsSync,
    readProjectDataSync,
    readProjectDirSync,
    contextId
  } = api.props.tc;
  const {reference: {bookId}} = contextId;
  let checkDataObject;
  const loadPath = generateCheckPath(checkType, bookId, chapter, verse);

  if (loadPath && contextId && projectDataPathExistsSync(loadPath)) {
    let files = readProjectDirSync(loadPath);

    files = files.filter(file => // filter the filenames to only use .json
      path.extname(file) === '.json'
    );

    let sorted = files.sort(); // sort the files by time

    for (let i = sorted.length - 1; i >= 0; i--) { // check starting with most recent
      const file = sorted[i];

      // check each file for same current tool name
      try {
        const readPath = path.join(loadPath, file);
        let _checkDataObject = readProjectDataSync(readPath);
        if (_checkDataObject) {
          _checkDataObject = JSON.parse(_checkDataObject);
        }

        if (_checkDataObject && _checkDataObject.contextId &&
          _checkDataObject.contextId.tool === toolName) {
          checkDataObject = _checkDataObject; // return the first match since it is the latest modified one
          break;
        }
      } catch (err) {
        console.warn('File exists but could not be loaded \n', err);
      }
    }
  }
  /**
   * @description Will return undefined if checkDataObject was not populated
   * so that the load method returns and then dispatches an empty action object
   * to initialized the reducer.
   */
  return checkDataObject;
}
