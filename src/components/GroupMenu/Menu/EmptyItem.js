import React from "react";
import PropTypes from 'prop-types';
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from '@material-ui/core/ListItem';
import {withStyles} from '@material-ui/core/styles';

const styles = () => ({
  root: {
    borderBottom: 'solid #ffffff4d 1px'
  },
  primary: {
    color: '#FFFFFF',
    fontSize: 'inherit'
  }
});

/**
 * Renders an empty menu item with some basic text
 * @param {string} label - the text to display
 * @param {boolean} enabled - indicates if the item should be rendered
 * @param classes
 * @returns {*}
 * @constructor
 */
const EmptyItem = ({label, enabled, classes}) => {
  if (enabled && label) {
    return (
      <ListItem className={classes.root}>
        <ListItemText
          classes={{
            primary: classes.primary
          }}
          primary={label}
        />
      </ListItem>
    );
  } else {
    return null;
  }
};

EmptyItem.propTypes = {
  classes: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
  label: PropTypes.string
};

export default withStyles(styles)(EmptyItem);
