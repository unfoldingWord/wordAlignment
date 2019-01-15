import React from "react";
import PropTypes from "prop-types";

const FilterFunnelIcon = props => {
  const styles = {
    svg: {
      display: "inline-block",
      verticalAlign: "middle"
    },
    path: {
      fill: props.color
    }
  };

  return (
    <svg  style={styles.svg} width={`${props.width}`} height={`${props.height}`} viewBox="0 0 1000 1000">
      <g transform="translate(0.000000,1000.0) scale(0.8,-0.8)">
        <path style={styles.path} d="M150 1200h900q21 0 35.5 -14.5t14.5 -35.5t-14.5 -35.5t-35.5 -14.5h-900q-21 0 -35.5 14.5t-14.5 35.5t14.5 35.5t35.5 14.5zM700 500v-300l-200 -200v500l-350 500h900z"/>
      </g>
    </svg>
  );
};

FilterFunnelIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string
};

FilterFunnelIcon.defaultProps = {
  width: 18,
  height: 18
};

export default FilterFunnelIcon;
