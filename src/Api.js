import {ToolApi} from 'tc-tool';

export default class Api extends ToolApi {

  stateChangeThrottled(nextState, prevState) {
    console.warn('detected state changed', nextState, prevState);
  }
  
  /**
   * Called before the tool is added to tC.
   */
  toolWillConnect() {
    console.warn('tool is connecting');
  }

  /**
   * Called before the tool is removed from tC.
   */
  toolWillDisconnect() {
    console.warn('tool is disconnecting');
  }
}
