import Tool from './Tool';
import { createConnect } from './state/store';
import { getTranslate } from './state/reducers';

export default Tool;

exports.createConnect = createConnect;
exports.getTranslate = getTranslate;
