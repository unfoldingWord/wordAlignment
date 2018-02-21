import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// components
import WordBankArea from './components/WordBankArea';
import DropBoxArea from './components/DropBoxArea';
import isEqual from 'lodash/isEqual';
import path from 'path-extra';
import Tool, {createConnect} from './Tool';

const STORE_KEY = 'wordAlignment';

/**
 * The custom connect HOC for this tool
 */
exports.connect = createConnect(STORE_KEY);

/**
 * The base container for this tool
 */
class Container extends Component {

  componentWillMount() {
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
  }

  render() {
    // Modules not defined within translationWords
    const { ScripturePane } = this.props.currentToolViews;
    let scripturePane = <div />;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(this.props.resourcesReducer.bibles).length > 0) {
      scripturePane = <ScripturePane {...this.props} />;
    }

    const {appLanguage} = this.props;
    const localeDir = path.join(__dirname, './locale');

    return (
      <Tool appLanguage={appLanguage}
            storeKey={STORE_KEY}
            localeDir={localeDir}>
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <WordBankArea {...this.props} />
          <div style={{ flex: 0.8, width: '100%', height: '100%', paddingBottom: '150px' }}>
            {scripturePane}
            <DropBoxArea {...this.props} />
          </div>
        </div>
      </Tool>
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
