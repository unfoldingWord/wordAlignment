import Container from './src/components/Container';
import {connectTool} from 'tc-tool';
import reducer from './src/state/reducers';
import path from 'path';
import Api from './src/Api';
// import logic from './src/logic';

const NAMESPACE = 'wordAlignment';
const localeDir = path.join(__dirname, 'src/locale');
// const middleware = [logic];

export default connectTool(NAMESPACE, {localeDir, reducer, api: new Api()})(Container);
