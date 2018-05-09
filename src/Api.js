import {ToolApi} from 'tc-tool';
import isEqual from 'deep-equal';
import {getLegacyChapterAlignments} from './state/reducers';
import path from 'path-extra';

export default class Api extends ToolApi {

  stateChangeThrottled(nextState, prevState) {
    const {
      tcApi: {
        writeGlobalToolData,
        contextId: {reference: {bookId, chapter}}
      }
    } = this.props;
    console.log('state changed', nextState, prevState);
    if (prevState && !isEqual(prevState.tool, nextState.tool)) {
      const dataPath = path.join('alignmentData', bookId, chapter + '.json');
      const data = getLegacyChapterAlignments(nextState, chapter);
      if (data) {
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
