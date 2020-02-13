/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  GroupedMenu,
  generateMenuData,
  generateMenuItem,
  InvalidatedIcon,
  CheckIcon,
} from 'tc-ui-toolkit';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BlockIcon from '@material-ui/icons/Block';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import EditIcon from '@material-ui/icons/Edit';
import UnalignedIcon from '@material-ui/icons/RemoveCircle';
import { getChecks } from '../state/reducers';
import Api from '../Api';
import {
  BOOKMARKED_KEY,
  COMMENT_KEY,
  EDITED_KEY,
  FINISHED_KEY,
  INVALID_KEY,
  UNALIGNED_KEY,
} from '../state/reducers/GroupMenu';
import {
  getUserData,
  getBookName,
  getProjectPath,
  getProjectManifest,
  getCurrentToolName,
  getContextId,
  getGroupsData,
  getGroupsIndex,
} from '../state/selectors';
import { loadGroupsIndex, clearGroupsIndex } from '../state/actions/groupsIndexActions';
import { loadGroupsData, clearGroupsData } from '../state/actions/groupsDataActions';
import {
  loadCurrentContextId,
  changeCurrentContextId,
  clearContextId,
} from '../state/actions/contextIdActions';

function GroupMenuContainer({
  toolApi,
  bookName,
  translate,
  contextId,
  groupsData,
  groupsIndex,
  clearContextId,
  loadGroupsData,
  loadGroupsIndex,
  currentToolName,
  clearGroupsData,
  clearGroupsIndex,
  loadCurrentContextId,
  changeCurrentContextId,
}) {
  useEffect(() => {
    loadGroupsIndex();

    return () => {
      // Clean up groupsIndex on unmount
      clearGroupsIndex();
    };
  }, [currentToolName]);

  useEffect(() => {
    loadGroupsData();

    return () => {
      // Clean up groupsData on unmount
      clearGroupsData();
    };
  }, [currentToolName]);

  useEffect(() => {
    loadCurrentContextId();

    return () => {
      clearContextId();
    };
  }, [currentToolName]);

  /**
   * Handles click events from the menu
   */
  function handleClick(item) {
    changeCurrentContextId(item);
  }

  /**
   * Preprocess a menu item
   * @param {object} item - an item in the groups data
   * @returns {object} the updated item
   */
  function onProcessItem(item) {
    const { contextId: { reference: { chapter, verse } } } = item;

    const itemState = toolApi.getVerseData(chapter, verse);
    return {
      ...item,
      title: `${bookName} ${chapter}:${verse}`,
      completed: itemState[FINISHED_KEY],
      invalid: itemState[INVALID_KEY],
      unaligned: itemState[UNALIGNED_KEY],
      verseEdits: itemState[EDITED_KEY],
      comments: itemState[COMMENT_KEY],
      bookmarked: itemState[BOOKMARKED_KEY],
    };
  }

  const filters = [
    {
      label: translate('menu.invalidated'),
      key: 'invalid',
      icon: <InvalidatedIcon/>,
    },
    {
      label: translate('menu.bookmarks'),
      key: 'bookmarked',
      icon: <BookmarkIcon/>,
    },
    {
      label: translate('menu.completed'),
      key: 'completed',
      disables: ['incomplete'],
      icon: <CheckIcon/>,
    },
    {
      label: translate('menu.incomplete'),
      id: 'incomplete',
      key: 'completed',
      value: false,
      disables: ['completed'],
      icon: <BlockIcon/>,
    },
    {
      label: translate('menu.verse_edit'),
      key: 'verseEdits',
      icon: <EditIcon/>,
    },
    {
      label: translate('menu.comments'),
      key: 'comments',
      icon: <ModeCommentIcon/>,
    },
    {
      label: translate('menu.unaligned'),
      key: 'unaligned',
      icon: <UnalignedIcon/>,
    },
  ];

  const statusIcons = [
    {
      key: 'invalid',
      icon: <InvalidatedIcon style={{ color: 'white' }}/>,
    },
    {
      key: 'bookmarked',
      icon: <BookmarkIcon style={{ color: 'white' }}/>,
    },
    {
      key: 'completed',
      icon: <CheckIcon style={{ color: '#58c17a' }}/>,
    },
    {
      key: 'verseEdits',
      icon: <EditIcon style={{ color: 'white' }}/>,
    },
    {
      key: 'comments',
      icon: <ModeCommentIcon style={{ color: 'white' }}/>,
    },
  ];

  const entries = generateMenuData(
    groupsIndex,
    groupsData,
    'completed',
    onProcessItem
  );

  if (contextId) {
    const activeEntry = generateMenuItem(contextId, onProcessItem);
    return (
      <GroupedMenu
        filters={filters}
        entries={entries}
        active={activeEntry}
        statusIcons={statusIcons}
        emptyNotice={translate('menu.no_results')}
        title={translate('menu.menu_title')}
        onItemClick={handleClick}
      />
    );
  } else {
    return null;
  }
}

GroupMenuContainer.propTypes = {
  tc: PropTypes.object.isRequired,
  toolApi: PropTypes.instanceOf(Api),
  translate: PropTypes.func.isRequired,
  bookName: PropTypes.string.isRequired,
  contextId: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  // TRICKY: bind these to listen to state change events
  completedChecks: getChecks(state, 'completed'),
  currentToolName: getCurrentToolName(ownProps),
  bookName: getBookName(ownProps),
  groupsData: getGroupsData(state),
  groupsIndex: getGroupsIndex(state),
  contextId: getContextId(state),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    tc,
    translate,
    gatewayLanguageCode,
  } = ownProps;
  const { project: projectApi } = tc;
  const projectSaveLocation = getProjectPath(ownProps);
  const { project: { id: bookId } } = getProjectManifest(ownProps);
  const currentToolName = getCurrentToolName(ownProps);
  const userData = getUserData(ownProps);

  return {
    loadGroupsIndex: () => {
      dispatch(loadGroupsIndex(translate));
    },
    clearGroupsIndex: () => clearGroupsIndex(),
    loadGroupsData: () => {
      dispatch(loadGroupsData(currentToolName, projectApi));
    },
    clearGroupsData: () => clearGroupsData(),
    loadCurrentContextId: () => {
      dispatch(loadCurrentContextId(currentToolName, bookId, projectSaveLocation, userData, gatewayLanguageCode, tc));
    },
    changeCurrentContextId: ({ contextId = null }) => {
      dispatch(changeCurrentContextId(contextId, projectSaveLocation, userData, gatewayLanguageCode, tc));
    },
    clearContextId: () => clearContextId(),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupMenuContainer);
