import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = () => ({
  root: {
    position: "relative"
  },
  progress: {
    postiion: "absolute",
    color: "#44C6FF"
  },
  shadow: {
    position: "absolute",
    color: "#EEEEEE"
  }
});

/**
 * Displays a circular progress icon with a faint background
 * @param {number} progress - a value between 0 and 100 inclusive
 */
const ProgressIcon = ({ classes, progress }) => (
  <div className={classes.root}>
    <CircularProgress
      className={classes.shadow}
      size={24}
      thickness={8}
      variant="static"
      value={100}
    />
    <CircularProgress
      className={classes.progress}
      size={24}
      thickness={8}
      variant="static"
      value={progress}
    />
  </div>
);

ProgressIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  progress: PropTypes.number.isRequired
};

export default withStyles(styles)(ProgressIcon);
