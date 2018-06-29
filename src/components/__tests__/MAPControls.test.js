import MAPControls from '../MAPControls';
import React from 'react';
import renderer from 'react-test-renderer';

describe('MAPControls', () => {
  it('renders', () => {
    const wrapper = renderer.create(
      <MAPControls
        showPopover={jest.fn()}
        translate={k=>k}
        onAccept={jest.fn()}
        onReject={jest.fn()}
        onRefresh={jest.fn()}/>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
