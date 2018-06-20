import React from 'react';
import {connect} from 'react-redux';
import {GroupMenu} from 'tc-ui-toolkit';
import PropTypes from 'prop-types';

class GroupMenuContainer extends React.Component {
  getGroupProgress(groupIndex, groupsData, isVerseFinished) {
    let groupId = groupIndex.id;
    let totalChecks = groupsData[groupId].length;
    const doneChecks = groupsData[groupId].filter(groupData => {
      let verseFinished = false;
      const reference = groupData && groupData.contextId && groupData.contextId.reference ? groupData.contextId.reference : null;
      if (reference) {
        verseFinished = isVerseFinished(reference.chapter, reference.verse);
      }
      return verseFinished && !groupData.reminders;
    }).length;

    let progress = doneChecks / totalChecks;
    return progress;
  }

  render() {
    const {
      translate,
      actions,
      isVerseFinished,
      groupsDataReducer,
      groupsIndexReducer,
      groupMenuReducer,
      toolsReducer,
      contextId,
      manifest,
      projectSaveLocation
    } = this.props;
    return (
      <GroupMenu
        translate={translate}
        getSelections={(contextId) => actions.getSelectionsFromContextId(contextId, projectSaveLocation)}
        getGroupProgress={(groupIndex, groupsData) => (this.getGroupProgress(groupIndex, groupsData, isVerseFinished))}
        isVerseFinished={isVerseFinished}
        groupsDataReducer={groupsDataReducer}
        groupsIndexReducer={groupsIndexReducer}
        groupMenuReducer={groupMenuReducer}
        toolsReducer={toolsReducer}
        contextIdReducer={{contextId}}
        projectDetailsReducer={{manifest, projectSaveLocation}}
        actions={actions} />
    );
  }
}

GroupMenuContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  isVerseFinished: PropTypes.func.isRequired,
  groupsDataReducer: PropTypes.object.isRequired,
  groupsIndexReducer: PropTypes.object.isRequired,
  groupMenuReducer: PropTypes.object.isRequired,
  toolsReducer: PropTypes.object.isRequired,
  contextId:PropTypes.object.isRequired,
  manifest: PropTypes.object.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
};

export default connect()(GroupMenuContainer);
