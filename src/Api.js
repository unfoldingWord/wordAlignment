import {ToolApi} from 'tc-tool';
import isEqual from 'deep-equal';
import {getLegacyChapterAlignments} from './state/reducers';
import path from 'path-extra';

export default class Api extends ToolApi {

  stateChangeThrottled(nextState, prevState) {
    const {
      writeGlobalToolData,
      contextId: {reference: {bookId, chapter}}
    } = this.props;
    const writableChange = Boolean(prevState) && Boolean(nextState) &&
      !isEqual(prevState.tool, nextState.tool);
    if (writableChange) {
      // write alignment data to the project folder
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = getLegacyChapterAlignments(nextState, chapter);
      if (data) {
        return writeGlobalToolData(dataPath, JSON.stringify(data));
      }
    }
  }

  toolWillConnect() {
    console.warn('tool is connecting');
  }

  toolWillDisconnect() {
    console.warn('tool is disconnecting');
  }

  toolWillReceiveProps(nextProps, prevProps) {
    console.warn('tool received props', nextProps, prevProps);
  }

  getIsVerseFinished(chapter, verse) {
    // TODO: check if the verse has finished being aligned
    return false;
  }
}
