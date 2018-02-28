import React from 'react';
import renderer from 'react-test-renderer';
import Word from '../src/components/Word/Word';

test('single occurrence', () => {
    const wrapper = renderer.create(
        <Word isDragging={false}
              occurrences={1}
              occurrence={1}
              word={"hello"}/>
    );
    expect(wrapper).toMatchSnapshot();
});
