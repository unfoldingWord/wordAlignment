import React from 'react';
import {connect} from 'react-redux';
import {GroupMenu} from 'tc-ui-toolkit';
import PropTypes from 'prop-types';
import Api from '../Api';

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

    return doneChecks / totalChecks;
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
  tc: PropTypes.object.isRequired,
  toolApi: PropTypes.instanceOf(Api),
  translate: PropTypes.func.isRequired,

  // mapped from props
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

const mapStateToProps = (state, props) => {
  const {tc, translate, toolApi} = props;

  return {
    toolsReducer: tc.toolsReducer,
    groupsDataReducer: tc.groupsDataReducer,
    groupsIndexReducer: tc.groupsIndexReducer,
    groupMenuReducer: tc.groupMenuReducer,
    translate,
    actions: tc.actions,
    isVerseFinished: toolApi.getIsVerseFinished,
    contextId: tc.contextId,
    manifest: tc.projectDetailsReducer.manifest,
    projectSaveLocation: tc.projectDetailsReducer.projectSaveLocation
  };
};

export default connect(mapStateToProps)(GroupMenuContainer);
