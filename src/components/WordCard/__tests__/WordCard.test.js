import React from 'react';
import renderer from 'react-test-renderer';
import Word from '../index';

it('occurs once', () => {
  const wrapper = renderer.create(
    <Word occurrences={1}
          occurrence={1}
          word={'hello'}/>
  );
  expect(wrapper).toMatchSnapshot();
});

it('renders rtl', () => {
  const wrapper = renderer.create(
    <Word occurrences={1}
          occurrence={1}
          direction={'rtl'}
          word={'hello'}/>
  );
  expect(wrapper).toMatchSnapshot();
});

it('occurs multiple times', () => {
  const wrapper = renderer.create(
    <Word occurrences={2}
          occurrence={1}
          word={'hello'}/>
  );
  expect(wrapper).toMatchSnapshot();
});

it('is a suggestion', () => {
  const wrapper = renderer.create(
    <Word occurrences={2}
          occurrence={1}
          isSuggestion={true}
          word={'hello'}/>
  );
  expect(wrapper).toMatchSnapshot();
});
