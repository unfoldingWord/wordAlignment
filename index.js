import Container from './src/components/Container';
import {connectTool} from 'tc-tool';
import path from 'path';

const NAMESPACE = 'wordAlignment';
const LOCALE_DIR = path.join(__dirname, 'src/locale');

export default {
  name: NAMESPACE,
  container: connectTool(LOCALE_DIR)(Container)
};
