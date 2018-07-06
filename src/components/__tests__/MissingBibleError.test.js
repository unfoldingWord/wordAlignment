import React from 'react';
import renderer from 'react-test-renderer';
import MissingBibleError from '../MissingBibleError';

describe('MissingBibleError', () => {
  it('renders', () => {
    const wrapper = renderer.create(
      <MissingBibleError translate={k=>k}/>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
