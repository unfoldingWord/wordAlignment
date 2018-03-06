import Container from './src/components/Container';
import {connectTool} from 'tc-tool';

const NAMESPACE = 'wordAlignment';

export default {
  name: NAMESPACE,
  container: connectTool()(Container)
};
