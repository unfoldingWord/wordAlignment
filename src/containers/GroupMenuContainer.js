import React from 'react';
import {connect} from 'react-redux';
import {GroupedMenu, generateMenuData, generateMenuItem, InvalidatedIcon, CheckIcon} from 'tc-ui-toolkit';
import PropTypes from 'prop-types';
import Api from '../Api';
import {getChecks} from '../state/reducers';

import BookmarkIcon from '@material-ui/icons/Bookmark';
import BlockIcon from '@material-ui/icons/Block';
import ModeCommentIcon from '@material-ui/icons/ModeComment';
import EditIcon from '@material-ui/icons/Edit';

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

    return {
      ...item,
      title: `${bookName} ${chapter}:${verse}`,
      completed: toolApi.getIsVerseFinished(chapter, verse), // TODO: I could read from state if I load these into the reducer at startup.
      invalid: toolApi.getIsVerseInvalid(chapter, verse)
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
        order: 1,
        icon: <InvalidatedIcon/>
      },
      {
        label: translate('menu.bookmarks'),
        key: 'bookmarked',
        order: 2,
        icon: <BookmarkIcon/>
      },
      {
        label: translate('menu.completed'),
        key: 'completed',
        order: 3,
        disables: ['incomplete'],
        icon: <CheckIcon/>
      },
      {
        label: translate('menu.incomplete'),
        id: 'incomplete',
        key: 'completed',
        order: 4,
        value: false,
        disables: ['completed'],
        icon: <BlockIcon/>
      },
      {
        label: translate('menu.verse_edit'),
        key: 'verseEdits',
        order: 5,
        icon: <EditIcon/>
      },
      {
        label: translate('menu.comments'),
        key: 'comments',
        order: 6,
        icon: <ModeCommentIcon/>
      }
    ];

    const statusIcons = [
      {
        key: 'invalid',
        icon: <InvalidatedIcon style={{color: "white"}}/>
      },
      {
        key: 'bookmarks',
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
