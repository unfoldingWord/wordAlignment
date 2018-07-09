import MAPControls from '../MAPControls';
import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

describe('MAPControls', () => {
  it('renders', () => {
    const wrapper = shallow(
      <MAPControls
        complete={false}
        onToggleComplete={jest.fn()}
        showPopover={jest.fn()}
        translate={k=>k}
        onAccept={jest.fn()}
        onReject={jest.fn()}
        onRefresh={jest.fn()}/>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
