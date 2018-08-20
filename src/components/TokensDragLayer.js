import React from 'react';
import PropTypes from 'prop-types';
import Word from './WordCard';
import {DragLayer} from 'react-dnd';
import * as types from './WordCard/Types';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

const getFieldStyle = (isDragging) => {
  const style = {
    width: 300,
    maxWidth: 300
  };
  style.opacity = isDragging ? 0.8 : 1;
  return style;
};

const getItemStyles = (props) => {
  const {currentOffset} = props;
  if (!currentOffset) {
    return {
      display: 'none'
    };
  }

  const {x, y} = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform
  };
};

const collect = (monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
});

class TokensDragLayer extends React.Component {

  renderToken(type, item) {
    switch (type) {
      case types.SECONDARY_WORD: {
        const tokens = item.tokens.map((token, key) => (
          <Word key={key}
                word={token.text}
                occurrence={token.occurrence}
                occurrences={token.occurrences}/>
        ));
        return (
          <div>
            {tokens}
          </div>
        );
      }
      default:
        return null;
    }
  }

  render() {
    const {item, itemType, isDragging} = this.props;
    if (!isDragging) {
      return null;
    }

    return (
      <div style={layerStyles}>
        <div style={getItemStyles(this.props)}>
          <div style={getFieldStyle(this.props.isDragging)}>
            {this.renderToken(itemType, item)}
          </div>
        </div>
      </div>
    );
  }
}

TokensDragLayer.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  initialOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  currentOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  isDragging: PropTypes.bool.isRequired
};
const dragLayer = DragLayer;
export default dragLayer(collect)(TokensDragLayer);
