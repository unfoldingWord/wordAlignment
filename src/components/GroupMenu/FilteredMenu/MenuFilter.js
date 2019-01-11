import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Divider from "@material-ui/core/Divider";
import CheckBoxOutlineIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ListItemText from "@material-ui/core/ListItemText";
import MenuFilterIcon from "./MenuFilterIcon";
import Chip from "@material-ui/core/Chip";

const styles = theme => ({
  root: {
    backgroundColor: "#19579E",
    zIndex: 10,
    color: "#FFFFFF"
  },
  divider: {
    borderBottom: "solid 1px #FFFFFF9e"
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14
  },
  checkbox: {
    color: "#FFFFFF"
  },
  chip: {
    color: "#ffffff",
    borderColor: "#ffffff",
    margin: 5
  },
  chipLabel: {
    fontSize: 14
  },
  chipDeleteIcon: {
    color: "#ffffff",
    "&:hover": {
      color: "#ffffff99"
    }
  },
  hover: {}
});

/**
 * A list of filter controls
 * @param {object[]} filters - an array of filters
 * @param {function} onToggle - callback to receive filter events
 * @param {string} [title] - the menu title
 * @param {object[]} [selected] - an array of selected filters
 *
 */
class MenuFilter extends React.Component {
  state = {
    open: false
  };

  /**
   * Handles opening the filter menu
   */
  handleOpen = () => {
    this.setState(state => ({ open: !state.open }));
  };

  /**
   * Handles toggling a filter
   * @param {object} filter - the filter being toggled
   */
  handleToggle = filter => e => {
    const { onToggle } = this.props;
    onToggle(filter);
  };

  /**
   * Checks if the filter is selected
   * @param {object} filter - the filter being inspected
   * @return {boolean} true if the filter is selected
   */
  isChecked = filter => {
    const { selected } = this.props;
    for (let i = 0, len = selected.length; i < len; i++) {
      if (selected[i].id === filter.id) {
        return true;
      }
    }
    return false;
  };

  /**
   * Checks if a filter is enabled
   * @param {object} filter - the filter
   */
  isEnabled = filter => {
    const { selected } = this.props;

    for (const f of selected) {
      if (f.disables.indexOf(filter.id) >= 0) {
        return false;
      }
    }
    return true;
  };

  render() {
    const { selected, classes, filters, title } = this.props;
    const { open } = this.state;

    return (
      <ListSubheader disableGutters className={classes.root}>
        <ListItem button className={classes.header} onClick={this.handleOpen}>
          <ListItemText
            classes={{
              primary: classes.text
            }}
            primary={title}
          />
          <MenuFilterIcon enabledFilterCount={selected.length} />
        </ListItem>
        <Collapse
          in={!open && selected.length > 0}
          timeout="auto"
          unmountOnExit
        >
          <Divider variant="middle" classes={{ middle: classes.divider }} />
          <div>
            {selected.map(filter => (
              <Chip
                key={filter.id}
                label={filter.label}
                variant="outlined"
                classes={{
                  deleteIcon: classes.chipDeleteIcon,
                  label: classes.chipLabel
                }}
                onDelete={this.handleToggle(filter)}
                className={classes.chip}
              />
            ))}
          </div>
        </Collapse>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Divider variant="middle" classes={{ middle: classes.divider }} />
          <List component="div" disablePadding>
            {filters.map((item, index) => (
              <ListItem
                key={index}
                button
                disabled={!this.isEnabled(item)}
                onClick={this.handleToggle(item)}
              >
                <ListItemIcon>
                  {this.isChecked(item) ? (
                    <CheckBoxIcon className={classes.checkbox} />
                  ) : (
                    <CheckBoxOutlineIcon className={classes.checkbox} />
                  )}
                </ListItemIcon>
                {item.icon
                  ? React.cloneElement(item.icon, {
                      style: { color: "#ffffff" }
                    })
                  : null}
                <ListItemText
                  classes={{
                    primary: classes.text
                  }}
                  primary={item.label}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </ListSubheader>
    );
  }
}

MenuFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  filters: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  title: PropTypes.string,
  selected: PropTypes.arrayOf(PropTypes.object)
};
MenuFilter.defaultProps = {
  selected: []
};

export default withStyles(styles)(MenuFilter);
