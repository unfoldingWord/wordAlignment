import { combineReducers } from 'redux';
import { localeReducer as locale } from 'react-localize-redux';

const reducers = combineReducers({
  locale
});

export default reducers;
