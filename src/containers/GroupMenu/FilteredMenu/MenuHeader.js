import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";

const styles = theme => ({
  root: {
    backgroundColor: "#19579E",
    color: "#FFFFFF",
    zIndex: 10
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: "inherit"
  }
});

/**
 * A plain header to display when there are no filters.
 * @param {string} title - the menu title
 */
const MenuHeader = ({ classes, title }) => (
  <ListSubheader disableGutters className={classes.root}>
    <ListItem className={classes.header}>
      <ListItemText
        classes={{
          primary: classes.text
        }}
        primary={title}
      />
    </ListItem>
  </ListSubheader>
);

MenuHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
};

export default withStyles(styles)(MenuHeader);
