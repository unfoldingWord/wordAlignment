import React from 'react';
import {Glyphicon} from 'react-bootstrap';

export function makeGlyphIcon(glyph, props={}) {
  // TRICKY: force icon size to always be 18 pixels.
  let styles = {
    fontSize: 18
  };
  if(props.style) {
    styles = {
      ...props.style,
      fontSize:18
    };
  }

  const newProps = {
    ...props,
    style: styles
  };
  return <Glyphicon key={glyph}
                    glyph={glyph}
                    className={`status-icon-${glyph}`}
                    {...newProps} />;
}
