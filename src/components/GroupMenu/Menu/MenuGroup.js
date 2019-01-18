import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ProgressIcon from './ProgressIcon';

/**
 * Utility to apply styles based on props
 */
const styledBy = (property, mapping) => props => mapping[props[property]];

const styles = {
  textRoot: {
    paddingRight: 0
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: styledBy('selected', {
      true: 700,
      false: 'normal'
    })
  },
  root: {
    // paddingRight: 0,
    borderBottom: 'solid #ffffff4d 1px',
    '&:hover': {
      backgroundColor: 'transparent'
    },
    '&$selected': {
      backgroundColor: '#2196F3',
      '&:hover': {
        backgroundColor: '#2196F3'
      }
    }
  },
  selected: {}
};

/**
 * Renders a group within the menu
 * @param {string} label - the group text
 * @param {function} onClick - a callback to receive group click events
 * @param {boolean} [selected=false] - indicates if the group is selected
 * @param {boolean} [open=false] - indicates if the group is open/expanded
 * @param {number} [progress=0] - a value between 0 and 100 inclusive
 */
class MenuGroup extends React.Component {

  shouldComponentUpdate(nextProps) {
    const {selected, open, label, progress} = this.props;
    return selected !== nextProps.selected || open !== nextProps.open ||
      label !== nextProps.label || progress !== nextProps.progress;
  }

  render() {
    const {classes, selected, open, onClick, label, progress} = this.props;

    return (
      <ListItem
        button
        disableRipple={true}
        disableGutters={false}
        selected={selected}
        classes={{
          root: classes.root,
          selected: classes.selected
        }}
        onClick={onClick}
      >
        <ListItemIcon>
          <ProgressIcon progress={progress}/>
        </ListItemIcon>
        <ListItemText
          inset
          classes={{
            root: classes.textRoot,
            primary: classes.text
          }}
          primary={label}
        />
        {open ? <ExpandMore/> : <ChevronRight/>}
      </ListItem>
    );
  }
}

MenuGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  open: PropTypes.bool,
  progress: PropTypes.number
};

MenuGroup.defaultProps = {
  selected: false,
  open: false,
  progress: 0
};

export default withStyles(styles)(MenuGroup);
