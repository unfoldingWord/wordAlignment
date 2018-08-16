import Container from './src/components/Container';
import {connectTool} from 'tc-tool';
import reducer from './src/state/reducers';
import path from 'path';
import Api from './src/Api';
import { enableBatching } from 'redux-batched-actions';

export default connectTool('wordAlignment', {
  localeDir: path.join(__dirname, 'src/locale'),
  reducer: enableBatching(reducer),
  api: new Api()
})(Container);
