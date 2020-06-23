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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <MenuItem onClose={handleClose} disableOnClick>
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
  isRtl: PropTypes.bool.isRequired,
  namespace: PropTypes.string.isRequired,
  anchorOrigin: PropTypes.object.isRequired,
  toolsSettings: PropTypes.object.isRequired,
  setToolSettings: PropTypes.func.isRequired,
  transformOrigin: PropTypes.object.isRequired,
};

export default ThreeDotMenu;
