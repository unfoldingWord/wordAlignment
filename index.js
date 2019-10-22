import path from 'path';
import { connectTool } from 'tc-tool';
import Container from './src/components/Container';
import reducer from './src/state/reducers';
import Api from './src/Api';

export default connectTool('wordAlignment', {
  localeDir: path.join(__dirname, 'src/locale'),
  reducer: reducer,
  api: new Api(),
})(Container);
