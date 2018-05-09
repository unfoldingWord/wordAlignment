import {ToolApi} from 'tc-tool';
import isEqual from 'deep-equal';
import {getLegacyChapterAlignments} from './state/reducers';
import path from 'path-extra';

export default class Api extends ToolApi {

  stateChangeThrottled(nextState, prevState) {
    console.warn('checking if save is needed', nextState, prevState, Boolean(prevState), !isEqual(prevState.tool, nextState.tool));
    const {
      tcApi: {
        writeGlobalToolData,
        contextId: {reference: {bookId, chapter}}
      }
    } = this.props;
    if (Boolean(prevState) && !isEqual(prevState.tool, nextState.tool)) {
      console.warn('preparing to write data');
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = getLegacyChapterAlignments(nextState, chapter);
      if (data) {
        console.error('writing data');
        return writeGlobalToolData(dataPath, JSON.stringify(data)).then(() => {
          this.setState({
            writing: false
          });
        });
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
