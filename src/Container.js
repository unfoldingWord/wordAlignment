import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// components
import SourceWordsArea from './components/SourceWordsArea';
import TargetWordsArea from './components/TargetWordsArea';

class Container extends Component {

  componentWillMount() {
    // set the ScripturePane to display ulb and ugnt
    this.props.actions.setToolSettings("ScripturePane", "currentPaneSettings", ["ulb", "ugnt"]);
  }

  render() {
    // Modules not defined within translationWords
    const { ScripturePane } = this.props.currentToolViews;
    let scripturePane = <div></div>
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (Object.keys(this.props.resourcesReducer.bibles).length > 0) {
      scripturePane = <ScripturePane {...this.props} />
    }

    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <SourceWordsArea {...this.props}/>
        <div style={{ flex: 0.8, width: '100%', height: '100%', paddingBottom: '150px' }}>
          {scripturePane}
          <TargetWordsArea {...this.props} />
        </div>
      </div>
    );
  }
}

Container.propTypes = {
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired
}

export default DragDropContext(HTML5Backend)(Container);