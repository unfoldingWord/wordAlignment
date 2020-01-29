import React from 'react';
import {connect} from 'react-redux';
import {GroupedMenu, generateMenuData, generateMenuItem, InvalidatedIcon, CheckIcon} from 'tc-ui-toolkit';
import PropTypes from 'prop-types';

import BookmarkIcon from '@material-ui/icons/Bookmark';
import BlockIcon from '@material-ui/icons/Block';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import EditIcon from '@material-ui/icons/Edit';
import UnalignedIcon from '@material-ui/icons/RemoveCircle';
import {getChecks} from '../state/reducers';
import Api from '../Api';
import {
  BOOKMARKED_KEY,
  COMMENT_KEY,
  EDITED_KEY,
  FINISHED_KEY,
  INVALID_KEY,
  UNALIGNED_KEY
} from "../state/reducers/GroupMenu";

class GroupMenuContainer extends React.Component {

  /**
   * Handles click events from the menu
   * @param {object} contextId - the menu item's context id
   */
  handleClick = ({contextId}) => {
    const {tc: {actions: {changeCurrentContextId}}} = this.props;
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
  };

  render() {
    const {
      translate,
      tc: {
        contextId,
        groupsDataReducer: {groupsData},
        groupsIndexReducer: {groupsIndex}
      }
    } = this.props;

    const filters = [
      {
        label: translate('menu.invalidated'),
        key: 'invalid',
        icon: <InvalidatedIcon/>
      },
      {
        label: translate('menu.bookmarks'),
        key: 'bookmarked',
        icon: <BookmarkIcon/>
      },
      {
        label: translate('menu.completed'),
        key: 'completed',
        disables: ['incomplete'],
        icon: <CheckIcon/>
      },
      {
        label: translate('menu.incomplete'),
        id: 'incomplete',
        key: 'completed',
        value: false,
        disables: ['completed'],
        icon: <BlockIcon/>
      },
      {
        label: translate('menu.verse_edit'),
        key: 'verseEdits',
        icon: <EditIcon/>
      },
      {
        label: translate('menu.comments'),
        key: 'comments',
        icon: <ModeCommentIcon/>
      },
      {
        label: translate('menu.unaligned'),
        key: 'unaligned',
        icon: <UnalignedIcon/>
      }
    ];

    const statusIcons = [
      {
        key: 'invalid',
        icon: <InvalidatedIcon style={{color: "white"}}/>
      },
      {
        key: 'bookmarked',
        icon: <BookmarkIcon style={{color: "white"}}/>
      },
      {
        key: 'completed',
        icon: <CheckIcon style={{color: "#58c17a"}}/>
      },
      {
        key: 'verseEdits',
        icon: <EditIcon style={{color: "white"}}/>
      },
      {
        key: 'comments',
        icon: <ModeCommentIcon style={{color: "white"}}/>
      }
    ];

    const entries = generateMenuData(
      groupsIndex,
      groupsData,
      'completed',
      this.onProcessItem
    );
    const activeEntry = generateMenuItem(contextId, this.onProcessItem);

    return (
      <GroupedMenu
        filters={filters}
        entries={entries}
        active={activeEntry}
        statusIcons={statusIcons}
        emptyNotice={translate('menu.no_results')}
        title={translate('menu.menu_title')}
        onItemClick={this.handleClick}
      />
    );
  }
}

GroupMenuContainer.propTypes = {
  tc: PropTypes.object.isRequired,
  toolApi: PropTypes.instanceOf(Api),
  translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  // TRICKY: bind these to listen to state change events
  completedChecks: getChecks(state, 'completed')
});

export default connect(mapStateToProps)(GroupMenuContainer);
