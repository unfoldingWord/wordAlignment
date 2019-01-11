import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ProgressIcon from "./ProgressIcon";

/**
 * Utiltiy to apply styles based on props
 */
const styledBy = (property, mapping) => props => mapping[props[property]];

const styles = {
  text: {
    color: "#FFFFFF",
    fontWeight: styledBy("selected", {
      true: "bold",
      false: "normal"
    })
  },
  root: {
    borderBottom: "solid #ffffff4d 1px",
    "&$selected": {
      backgroundColor: "#2196F3",
      "&:hover": {
        backgroundColor: "#1f8de4"
      }
    }
  },
  selected: {}
};

/**
 * Renders a group within the menu
 * @param {string} label - the group text
 * @param {function} onClick - a callback to receive group click events
 * @param {bool} [selected=false] - indicates if the group is selected
 * @param {bool} [open=false] - indicates if the group is open/expanded
 * @param {number} [progress=0] - a value between 0 and 100 inclusive
 */
class MenuGroup extends React.Component {
  render() {
    const { classes, selected, open, onClick, label, progress } = this.props;
    return (
      <ListItem
        button
        selected={selected}
        classes={{
          root: classes.root,
          selected: classes.selected
        }}
        onClick={onClick}
      >
        <ListItemIcon>
          <ProgressIcon progress={progress} />
        </ListItemIcon>
        <ListItemText
          inset
          classes={{
            primary: classes.text
          }}
          primary={label}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
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
