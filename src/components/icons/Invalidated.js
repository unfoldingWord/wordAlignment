import React from 'react';
import InvalidatedSVG from './InvalidatedSVG';

export default function Invalidated(props={}) {
  return (
    <div key="invalidated" className={'glyphicon glyphicon-invalidated'}>
      <InvalidatedSVG height={16} width={16} {...props}/>
    </div>
  );
}
