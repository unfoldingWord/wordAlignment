import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import FilterListIcon from "@material-ui/icons/FilterList";
import Badge from "@material-ui/core/Badge";

const styles = theme => ({
  badge: {
    border: "2px solid #19579E",
    backgroundColor: "#FFFFFF",
    color: "#19579E",
    fontWeight: "bold",
    fontSize: "inherit",
    width: 20,
    height: 20,
    marginTop: 2
  }
});

/**
 * A badged filter icon
 * @param {number} enabledFilterCount - the number of filters that have been selected
 */
const MenuFilterIcon = ({ enabledFilterCount, classes }) => {
  const count = enabledFilterCount > 0 ? enabledFilterCount : 0;
  return (
    <Badge
      badgeContent={count}
      invisible={count <= 0}
      classes={{ badge: classes.badge }}
    >
      <FilterListIcon />
    </Badge>
  );
};

MenuFilterIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  enabledFilterCount: PropTypes.number.isRequired
};

MenuFilterIcon.muiName = "Icon";

export default withStyles(styles)(MenuFilterIcon);
