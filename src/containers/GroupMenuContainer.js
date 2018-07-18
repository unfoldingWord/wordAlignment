import React from 'react';
import {connect} from 'react-redux';
import {GroupMenu} from 'tc-ui-toolkit';
import PropTypes from 'prop-types';
import Api from '../Api';

class GroupMenuContainer extends React.Component {
  constructor(props) {
    super(props);
    this._handleIsVerseValid = this._handleIsVerseValid.bind(this);
    this._handleGetSelections = this._handleGetSelections.bind(this);
    this._handleGetGroupProgress = this._handleGetGroupProgress.bind(this);
  }

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

  /**
   * Handles check to determine if a verse is valid
   * @param {number} chapter
   * @param {number} verse
   * @return {boolean}
   * @private
   */
  _handleIsVerseValid(chapter, verse) {
    const {toolApi} = this.props;
    return !toolApi.getIsVerseInvalid(chapter, verse);
  }

  /**
   * Handles retrieving selections
   * @param contextId
   * @private
   */
  _handleGetSelections(contextId) {
    const {
      tc: {
        actions: {getSelectionsFromContextId}
      },
      projectSaveLocation
    } = this.props;
    return getSelectionsFromContextId(contextId, projectSaveLocation);
  }

  /**
   * Handles fetching the group progress
   * @param groupIndex
   * @param groupsData
   * @return {*}
   * @private
   */
  _handleGetGroupProgress(groupIndex, groupsData) {
    const {
      isVerseFinished
    } = this.props;
    return this.getGroupProgress(groupIndex, groupsData, isVerseFinished);
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
        getSelections={this._handleGetSelections}
        getGroupProgress={this._handleGetGroupProgress}
        isVerseFinished={isVerseFinished}
        isVerseValid={this._handleIsVerseValid}
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
    isVerseValid: toolApi.getIsVerseInvalid,
    contextId: tc.contextId,
    manifest: tc.projectDetailsReducer.manifest,
    projectSaveLocation: tc.projectDetailsReducer.projectSaveLocation
  };
};

export default connect(mapStateToProps)(GroupMenuContainer);
