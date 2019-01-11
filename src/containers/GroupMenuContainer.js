import React from 'react';
import {connect} from 'react-redux';
import GroupMenu, {generateMenuData} from '../components/GroupMenu';
import PropTypes from 'prop-types';
import Api from '../Api';
import CheckIcon from '@material-ui/icons/Check';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import BlockIcon from '@material-ui/icons/Block';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import EditIcon from '@material-ui/icons/Edit';

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
      const reference = groupData && groupData.contextId &&
      groupData.contextId.reference ? groupData.contextId.reference : null;
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

  /**
   * Handles click events from the menu
   * @param {object} contextId - the menu item's context id
   */
  handleClick = contextId => {
    const {actions: {changeCurrentContextId}} = this.props;
    changeCurrentContextId(contextId);
  };

  /**
   * Preprocess a menu item
   * @param {object} item - an item in the groups data
   * @returns {object} the updated item
   */
  onProcessItem = item => {
    const {tc: {project}, toolApi} = this.props;
    const bookName = project.getBookName();

    const {
      contextId: {
        reference: {chapter, verse}
      }
    } = item;

    return {
      ...item,
      title: `${bookName} ${chapter}:${verse}`,
      finished: toolApi.getIsVerseFinished(chapter, verse)
    };
  };

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

    const filters = [
      {
        label: 'Completed',
        key: 'finished',
        disables: ['incomplete'],
        icon: <CheckIcon style={{color: '#ffffff'}}/>
      },
      {
        label: 'Incomplete',
        id: 'incomplete', // the default id is the key
        key: 'finished',
        value: false, // the default value is true
        disables: ['finished'], // the default is []. this refers to the filter id
        icon: <BlockIcon/>
      },
      {
        label: 'Bookmarks',
        key: 'bookmarks',
        icon: <BookmarkIcon style={{color: '#ffffff'}}/>
      },
      {
        label: 'Invalidated', // localized
        key: 'invalidated',
        icon: <LinkOffIcon style={{color: '#ffffff'}}/>
      },
      {
        label: 'Comments',
        key: 'comments',
        icon: <ModeCommentIcon style={{color: '#ffffff'}}/>
      },
      {
        label: 'Verse edit',
        key: 'verseEdits',
        icon: <EditIcon style={{color: '#ffffff'}}/>
      }
    ];
    const statusIcons = filters.filter(f => f.id !== 'incomplete');

    const entries = generateMenuData(
      groupsIndexReducer.groupsIndex,
      groupsDataReducer.groupsData,
      'finished',
      this.onProcessItem
    );

    return (
      <GroupMenu
        filters={filters}
        entries={entries}
        active={contextId}
        statusIcons={statusIcons}
        emptyNotice="No results found"
        title="Menu"
        onItemClick={this.handleClick}

        // translate={translate}
        // getSelections={this._handleGetSelections}
        // getGroupProgress={this._handleGetGroupProgress}
        // isVerseFinished={isVerseFinished}
        // isVerseValid={this._handleIsVerseValid}
        // groupsDataReducer={groupsDataReducer}
        // groupsIndexReducer={groupsIndexReducer}
        // groupMenuReducer={groupMenuReducer}
        // toolsReducer={toolsReducer}
        // contextIdReducer={{contextId}}
        // projectDetailsReducer={{manifest, projectSaveLocation}}
        // actions={actions}
      />
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
  contextId: PropTypes.object.isRequired,
  manifest: PropTypes.object.isRequired,
  projectSaveLocation: PropTypes.string.isRequired
};

const mapStateToProps = (state, props) => {
  const {tc, translate, toolApi} = props;

  return {
    toolsReducer: {currentToolName: tc.selectedToolName},
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
