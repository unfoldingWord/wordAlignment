import Tool,  {connectTool} from './Tool';
import { createConnect } from './state/store';
import { getTranslate } from './state/reducers';

export default Tool;

exports.connectTool = connectTool;
exports.createConnect = createConnect;
exports.getTranslate = getTranslate;
