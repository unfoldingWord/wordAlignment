import {ToolApi} from 'tc-tool';

export default class Api extends ToolApi {

  stateChangeThrottled(nextState, prevState) {
    console.warn('detected state changed', nextState, prevState);
    return new Promise((resolve, reject) => {

    });
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
}
