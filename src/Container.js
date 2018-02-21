import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// components
import WordBankArea from './components/WordBankArea';
import DropBoxArea from './components/DropBoxArea';
import isEqual from 'lodash/isEqual';
import {configureStore, Provider} from './state/store';
import {loadLocalization} from './state/actions/locale';
import {setActiveLanguage} from 'react-localize-redux';
import path from 'path-extra';


class Container extends Component {

  constructor(props) {
    super(props);
    this.state = {
      store: null
    };
  }

  componentWillMount() {
    const {appLanguage} = this.props;
    const store = configureStore();
    this.setState({
      store
    });
    const localeDir = path.join(__dirname, '../locale');
    store.dispatch(loadLocalization(localeDir, appLanguage));

    // current panes persisted in the scripture pane settings.
    const {ScripturePane} = this.props.settingsReducer.toolsSettings;
    let panes = [];
    if (ScripturePane) panes = ScripturePane.currentPaneSettings;
    // filter out targetLanguage and bhp
    panes = panes.filter((pane) => {
      return pane !== "targetLanguage" && pane !== "bhp" && pane !== "ugnt";
    });
    // getting the last pane from the panes array if it exist otherwise equal to null.
    const lastPane = panes[panes.length - 1] ? panes[panes.length - 1] : null;
    // set the ScripturePane to display targetLanguage and bhp for the word alignment tool from left to right.
    let desiredPanes = ["targetLanguage", "ugnt"];
    // if last pane found in previous scripture pane settings then carry it over to new settings in wordAlignment.
    if (lastPane && lastPane !== "targetLanguage" && lastPane !== "bhp" && lastPane !== "ugnt") desiredPanes.push(lastPane);
    // set new pane settings
    this.props.actions.setToolSettings("ScripturePane", "currentPaneSettings", desiredPanes);
  }

  componentWillReceiveProps(nextProps) {
    if(!isEqual(this.props.contextIdReducer.contextId, nextProps.contextIdReducer.contextId)) {
      let page = document.getElementById("DropBoxArea");
      if (page) page.scrollTop = 0;
    }

    // stay in sync with the application language
    if(nextProps.appLanguage !== this.props.appLanguage) {
      const {store} = this.state;
      store.dispatch(setActiveLanguage(nextProps.appLanguage));
    }
  }

  render() {
    // Modules not defined within translationWords
    const { ScripturePane } = this.props.currentToolViews;
    let scripturePane = <div />;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(this.props.resourcesReducer.bibles).length > 0) {
      scripturePane = <ScripturePane {...this.props} />;
    }

    const {store} = this.state;

    return (
      <Provider store={store}>
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <WordBankArea {...this.props} />
          <div style={{ flex: 0.8, width: '100%', height: '100%', paddingBottom: '150px' }}>
            {scripturePane}
            <DropBoxArea {...this.props} />
          </div>
        </div>
      </Provider>
    );
  }
}

Container.propTypes = {
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired,
  settingsReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  appLanguage: PropTypes.string.isRequired
};

export default DragDropContext(HTML5Backend)(Container);
