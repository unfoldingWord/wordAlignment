import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import RootRef from '@material-ui/core/RootRef';
import MenuItem from './MenuItem';
import MenuGroup from './MenuGroup';
import memoize from 'memoize-one';
import EmptyItem from './EmptyItem';

const styles = () => ({
  root: {
    overflowY: 'scroll',
    color: '#FFFFFF',
    backgroundColor: '#333333'
  },
  header: {
    borderBottom: 'solid #ffffff4d 1px'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 'inherit'
  }
});

/**
 * Displays a list of grouped menu items
 * @param {[]} entries - an array of menu entries
 * @param {object} [active=null] - the contextId of the active menu item
 * @param {object[]} [statusIcons=[]] - an array of status configurations to control menu item icons
 * @param {*} [header=null] - a component to display as the menu header
 * @param {*} [height="auto"] - the height of the menu
 * @param {*} [width=400] - the width of the menu
 * @param {boolean} [autoSelect=true] - controls whether or not opening a group will automatically select the first child
 * @param {boolean} [autoScroll=true] - controls whether or not the menu will automatically scroll to the active item
 * @param {string} [emptyNotice=""] - an optional message to display when the menu is empty
 */
class Menu extends React.Component {
  menuRef = React.createRef();
  selectedGroupRef = React.createRef();
  selectedItemRef = React.createRef();

  constructor(props) {
    super(props);
    let autoOpen = null;

    // TRICKY: start with the controlled group open
    const {active, autoSelect} = props;
    if (active && autoSelect) {
      autoOpen = active.groupId;
    }

    this.state = {
      opened: autoOpen,
      active: null
    };
  }

  componentDidMount() {
    const {opened} = this.state;
    const {autoScroll} = this.props;

    // scroll to the selection
    if (autoScroll && opened) {
      this.scrollToSelectedItem();
    } else if (autoScroll) {
      this.scrollToSelectedGroup();
    }
  }

  /**
   *
   * @param prevProps
   * @param prevState
   * @param nextContent
   */
  componentDidUpdate(prevProps, prevState, nextContent) {
    const {opened} = this.state;
    const {autoScroll} = this.props;
    const prevActive = prevProps.active ? prevProps.active : prevState.active;
    const active = this.getActive();

    if (
      active &&
      prevActive &&
      prevActive.groupId !== active.groupId &&
      active.groupId !== opened
    ) {
      // open the active group if it was changed externally
      this.setState({
        opened: active.groupId
      });
    } else if (autoScroll && prevState.opened !== this.state.opened &&
      this.state.opened) {
      // scroll to the selection when opened
      this.scrollToSelectedItem();
    }
  }

  /**
   * Scrolls the selected group into view
   * @param {boolean} [instant=true] - makes the scroll execute instantly.
   */
  scrollToSelectedGroup = (instant = true) => {
    this.scrollIntoView(this.selectedGroupRef, instant);
  };

  /**
   * Scrolls the selected item into view
   * @param {boolean} [instant=true] - makes the scroll execute instantly.
   */
  scrollToSelectedItem = (instant = true) => {
    this.scrollIntoView(this.selectedItemRef, instant);
  };

  /**
   * Scrolls a ref into view
   * @param ref
   * @param {boolean} [instant=true] - makes the scroll execute instantly
   */
  scrollIntoView = (ref, instant = true) => {
    if (
      ref &&
      ref.scrollIntoView &&
      !this.isRefInView(ref)
    ) {
      ref.scrollIntoView({
        block: 'center',
        behavior: instant ? 'instant' : 'smooth'
      });
    }
  };

  /**
   * Checks if a dom rect is within another
   * @param ref - a react ref
   * @returns {boolean}
   */
  isRefInView = (ref) => {
    if (ref && ref.getBoundingClientRect && this.menuRef &&
      this.menuRef.current && this.menuRef.current.getBoundingClientRect) {
      const rect = ref.getBoundingClientRect();
      const menuRect = this.menuRef.current.getBoundingClientRect();
      return rect.top >= menuRect.top && rect.bottom <= menuRect.bottom;
    } else {
      return false;
    }
  };

  /**
   * Applies default key values to the status icons.
   * This prepares status icons for use in the menu.
   * @param {object[]} statusIcons - an array of status icon objects
   * @returns {object[]} - an array of normalized status icon objects.
   */
  normalizeStatusIcons = memoize(statusIcons => {
    const normalized = [];
    for (let i = 0, len = statusIcons.length; i < len; i++) {
      const icon = Object.assign({}, {value: true}, statusIcons[i]);
      normalized.push(icon);
    }
    return normalized;
  });

  /**
   * Handles opening a group within the menu.
   * If auto selected is enabled this will also select the first child
   * @param {object} group - the group being opened
   */
  handleOpen = group => () => {
    const {autoSelect} = this.props;
    if (this.state.opened === group.id) {
      this.setState({opened: -1});
    } else {
      this.setState({opened: group.id});

      // auto select newly opened groups if not controlled elsewhere
      const firstChild = group.children[0];
      if (autoSelect && firstChild && !this.isGroupSelected(group)) {
        this.handleClick(firstChild.contextId)();
      }
    }
  };

  /**
   * Handles menu item clicks.
   * If the active menu item is controlled externally this will defer control to the parent
   * otherwise menu selections will be managed internally.
   * @param {object} contextId - the context id of the clicked menu item
   */
  handleClick = contextId => () => {
    const {onItemClick, active} = this.props;
    if (typeof onItemClick === 'function') {
      onItemClick(contextId);
    }

    // skip internal state if managed externally.
    if (!active) {
      this.setState({active: contextId});
    }
  };

  /**
   * Checks if a group is opened
   * @param {object} group - the menu group
   * @returns {boolean}
   */
  isGroupOpen = group => {
    return this.state.opened === group.id;
  };

  /**
   * Checks if a group is selected
   * @param {object} group - the menu group
   * @returns {boolean}
   */
  isGroupSelected = group => {
    const active = this.getActive();
    return active && group.id === active.groupId;
  };

  /**
   * Checks if a menu item is selected
   * @param {object} item - the menu item
   * @returns {boolean}
   */
  isItemSelected = item => {
    const active = this.getActive();
    const {
      contextId: {
        groupId,
        quote,
        occurrence,
        reference: {bookId, chapter, verse}
      }
    } = item;
    // TODO: is this compatible with all tools?
    return (
      active &&
      active.groupId === groupId &&
      active.quote === quote &&
      active.occurrence === occurrence &&
      active.reference.bookId === bookId &&
      active.reference.chapter === chapter &&
      active.reference.verse === verse
    );
  };

  /**
   * Returns the active context.
   * If the active item is controlled externally it will take precedence.
   * @returns {object|null}
   */
  getActive = () => {
    return this.props.active ? this.props.active : this.state.active;
  };

  /**
   * Collects the react ref to the group.
   * This determines if the group is selected and stores it's ref
   * @param {object} group - the menu group
   */
  handleGroupRef = group => ref => {
    if (this.isGroupSelected(group)) {
      this.selectedGroupRef = ref;
    }
  };

  /**
   * Collects the react ref to the item.
   * This determines if the menu item is selected and stores it's ref
   * @param {object} item - the menu item
   */
  handleItemRef = item => ref => {
    if (this.isItemSelected(item)) {
      this.selectedItemRef = ref;
    }
  };

  render() {
    const {
      classes,
      header,
      height,
      width,
      entries,
      statusIcons,
      emptyNotice
    } = this.props;

    const normalizedStatusIcons = this.normalizeStatusIcons(statusIcons);

    return (
      <RootRef rootRef={this.menuRef}>
        <List
          component="nav"
          subheader={header}
          className={classes.root}
          style={{height, width}}
        >
          {entries.map((group, index) => (
            <RootRef key={index} rootRef={this.handleGroupRef(group)}>
              <React.Fragment>
                <MenuGroup
                  selected={this.isGroupSelected(group)}
                  onClick={this.handleOpen(group)}
                  progress={group.progress}
                  open={this.isGroupOpen(group)}
                  label={group.title}
                />
                {/* TODO: The ui can't handle this much animation because changing context takes too much work */}
                {/*<Collapse*/}
                {/*in={this.isGroupOpen(group)}*/}
                {/*timeout="auto"*/}
                {/*unmountOnExit*/}
                {/*>*/}
                {this.isGroupOpen(group) ? (
                  <List component="div" disablePadding>
                    {group.children.map((item, index) => (
                      <RootRef key={index} rootRef={this.handleItemRef(item)}>
                        <MenuItem
                          status={item}
                          selected={this.isItemSelected(item)}
                          statusIcons={normalizedStatusIcons}
                          onClick={this.handleClick(item.contextId)}
                          title={item.title}
                        />
                      </RootRef>
                    ))}
                  </List>
                ) : null}

                {/*</Collapse>*/}
              </React.Fragment>
            </RootRef>
          ))}
          <EmptyItem key="empty" label={emptyNotice}
                     enabled={entries.length === 0}/>
        </List>
      </RootRef>
    );
  }
}

Menu.propTypes = {
  classes: PropTypes.object.isRequired,
  entries: PropTypes.array,
  active: PropTypes.object,
  header: PropTypes.element,
  height: PropTypes.any,
  onItemClick: PropTypes.func,
  width: PropTypes.number,
  statusIcons: PropTypes.array,
  emptyNotice: PropTypes.string,
  autoSelect: PropTypes.bool
};

Menu.defaultProps = {
  active: null,
  height: 'auto',
  entries: [],
  width: 250,
  emptyNotice: '',
  autoSelect: true,
  autoScroll: true,
  statusIcons: []
};

Menu.muiName = 'List';

export default withStyles(styles)(Menu);
