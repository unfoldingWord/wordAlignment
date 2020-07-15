import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  DropdownMenu,
  MenuItem,
  FontSizeSlider,
  ThreeDotIcon,
} from 'tc-ui-toolkit';

const ThreeDotMenu = ({
  isRtl,
  namespace,
  anchorOrigin,
  toolsSettings,
  setToolSettings,
  transformOrigin,
}) => {
  const [anchorPosition, setAnchorPosition] = useState(null);
  const open = Boolean(anchorPosition);

  const handleClick = event => {
    const anchorEl = event && event.currentTarget;
    if (anchorEl) {
      const anchorPosition_ = {top: anchorEl.offsetTop, left: anchorEl.offsetLeft};
      if (anchorOrigin) { // see if we need to shift origin
        if (anchorOrigin.vertical === 'bottom') {
          anchorPosition_.top += anchorEl.offsetHeight;
        }
        if (anchorOrigin.horizontal === 'right') {
          anchorPosition_.left += anchorEl.offsetWidth;
        }
      }
      setAnchorPosition(anchorPosition_);
    }
  };

  const handleClose = () => {
    setAnchorPosition(null);
  };

  const handleFontSizeChange = (fontSize) => {
    setToolSettings(namespace, 'fontSize', fontSize);
  };

  const { fontSize } = toolsSettings[namespace] || {};
  const iconStyle = isRtl ? { margin: '0 10px 0 0' } : { margin: '0 0 0 10px' };

  return (
    <React.Fragment>
      <ThreeDotIcon onClick={handleClick} style={iconStyle}/>
      <DropdownMenu
        open={open}
        anchorPosition={anchorPosition}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <MenuItem disableOnClick>
          <FontSizeSlider value={fontSize} onChange={handleFontSizeChange}/>
        </MenuItem>
      </DropdownMenu>
    </React.Fragment>
  );
};

ThreeDotMenu.defaultProps = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  transformOrigin: { vertical: 'top', horizontal: 'right' },
};

ThreeDotMenu.propTypes = {
  isRtl: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  anchorOrigin: PropTypes.object.isRequired,
  toolsSettings: PropTypes.object.isRequired,
  setToolSettings: PropTypes.func.isRequired,
  transformOrigin: PropTypes.object.isRequired,
};

export default ThreeDotMenu;
