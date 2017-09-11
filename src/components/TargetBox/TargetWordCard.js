import React from 'react';
import PropTypes from 'prop-types';

const internalStyle = {
  borderLeft: '5px solid #44C6FF',
  padding: '10px',
  marginBottom: '5px',
  color: '#ffffff',
  textAlign: 'center',
  backgroundColor: '#333333',
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset",
  cursor: 'move'
};

const TargetWordCard = ({
  word,
  style
}) => {
  return (
    <span style={{ ...internalStyle, ...style }}>
      {word}
    </span>
  );
};

TargetWordCard.propTypes = {
  word: PropTypes.string.isRequired,
  style: PropTypes.object
}

export default TargetWordCard;