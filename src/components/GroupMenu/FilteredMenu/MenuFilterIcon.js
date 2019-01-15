import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import FilterFunnelIcon from "./FilterFunnelIcon";

const styles = () => ({
  badge: {
    border: "2px solid #19579E",
    backgroundColor: "#933",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "inherit",
    width: 20,
    height: 20
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
      <FilterFunnelIcon color="#ffffff" />
    </Badge>
  );
};

MenuFilterIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  enabledFilterCount: PropTypes.number.isRequired
};

MenuFilterIcon.muiName = "Icon";

export default withStyles(styles)(MenuFilterIcon);
