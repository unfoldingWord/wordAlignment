/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import IconIndicators from '../../IconIndicators/index';

describe('IconIndicators component:', () => {

  test('Icons not visible', () => {
    // given
    const visible = false;
    const set = false;
    const props = getBaseProperties({}, visible, set);

    // when
    const component = renderer.create(
      <IconIndicators {...props} />
    );

    // then
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('Icons visible and not set', () => {
    // given
    const visible = true;
    const set = false;
    const props = getBaseProperties({}, visible, set);

    // when
    const component = renderer.create(
      <IconIndicators {...props} />
    );

    // then
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('Icons visible and set', () => {
    // given
    const visible = true;
    const set = true;
    const props = getBaseProperties({}, visible, set);

    // when
    const component = renderer.create(
      <IconIndicators {...props} />
    );

    // then
    expect(component.toJSON()).toMatchSnapshot();
  });
});

//
// helpers
//

function getBaseProperties(props, visible, set) {
  return {
    ...props,
    translate: text => text,
    verseEditStateSet: set,
    verseEditIconEnable: visible,
    commentStateSet: set,
    commentIconEnable: visible,
    bookmarkStateSet: set,
    bookmarkIconEnable: visible,
    toolsSettings: {}
  };
}

