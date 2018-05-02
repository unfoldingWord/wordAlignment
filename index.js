import Container from './src/components/Container';
import {connectTool} from 'tc-tool';
import reducers from './src/state/reducers';
import path from 'path';
// import logic from './src/logic';

const NAMESPACE = 'wordAlignment';
const LOCALE_DIR = path.join(__dirname, 'src/locale');
// const middleware = [logic];

export default {
  name: NAMESPACE,
  container: connectTool(LOCALE_DIR, reducers)(Container)
};
