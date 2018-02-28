import React from 'react';
import renderer from 'react-test-renderer';
import Word from '../src/components/Word';

test('single occurrence', () => {
    const wrapper = renderer.create(
        <Word occurrences={1}
              occurrence={1}
              word={"hello"}/>
    );
    expect(wrapper).toMatchSnapshot();
});

test('multiple occurrence', () => {
  const wrapper = renderer.create(
    <Word occurrences={2}
          occurrence={1}
          word={"hello"}/>
  );
  expect(wrapper).toMatchSnapshot();
});
