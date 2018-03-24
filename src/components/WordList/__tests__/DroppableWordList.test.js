/* eslint-env jest */

import Word from '../../../specs/Word';
import React, {Component} from 'react';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import DroppableWordList from '../index';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Test DroppableWordList component in WordList/index.js', () => {
  let props;

  beforeEach(() => {
    const w3 = new Word('w3');
    w3.disable();
    const words = [
      new Word('w1', 1, 1),
      new Word('w2', 1, 2),
      new Word('w2', 2, 2),
      w3
    ];
    props = {
      chapter: 1,
      verse: 1,
      words: words,
      isOver: false,
      moveBackToWordBank: jest.fn()
    };
  });

  test('DroppableWordList component full integration test', () => {
    const WrappedWordList = wrapInTestContext(DroppableWordList);
    const wrapper = renderer.create(<WrappedWordList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('DroppableWordList test scroll save and restore', () => {
    const WrappedWordList = wrapInTestContext(DroppableWordList);
    const component = mount(<WrappedWordList {...props} />);
    component.setProps({chapter: 2, verse: 1});
  });
});

//
// Helpers
//

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}
