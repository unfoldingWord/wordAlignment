import path from 'path';
import { connectTool } from 'tc-tool';
import Container from './src/components/Container';
import reducer from './src/state/reducers';
import Api from './src/Api';

// Paths change when code is bundled w/ Webpack
const isProduction = process.env.NODE_ENV === 'production';
const STATIC_FOLDER_PATH = path.join(__dirname, 'static');// Path to static folder in webpacked code.
const localeDir = isProduction ? path.join(STATIC_FOLDER_PATH, 'tC_apps/wordAlignment/src/locale') : path.join('./src/tC_apps/wordAlignment/src/locale');

export default connectTool('wordAlignment', {
  localeDir,
  reducer: reducer,
  api: new Api(),
})(Container);
