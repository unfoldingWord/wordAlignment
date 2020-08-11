/* eslint-env jest */
import {Token} from 'wordmap-lexer';
import React, {Component} from 'react';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import DroppableWordList from '../index';

describe('Test DroppableWordList component in WordList/index.js', () => {
  let props;

  beforeEach(() => {
    const w3 = new Token({text: 'w3'});
    w3.disabled = true;
    const words = [
      new Token({text: 'w1'}),
      new Token({text: 'w2', occurrence: 1, occurrences: 2}),
      new Token({text: 'w2', occurrence: 2, occurrences: 2}),
      w3
    ];
    props = {
      chapter: 1,
      verse: 1,
      onDropTargetToken: jest.fn(),
      words: words,
      moveBackToWordBank: jest.fn(),
      modalOpen: false,
      toolsSettings: {}
    };
  });

  test('DroppableWordList component full integration test', () => {
    const WrappedWordList = wrapInTestContext(DroppableWordList);
    const wrapper = mount(<WrappedWordList {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('DroppableWordList test scroll save and restore', () => {
    const WrappedWordList = wrapInTestContext(DroppableWordList);
    props.wordList = {
      scrollTop: 100
    };
    const wrapper = mount(<WrappedWordList {...props} />);
    wrapper.setProps({isOver: true});
    wrapper.setProps({isOver: false});
    wrapper.setProps({modalOpen: false});
    wrapper.setProps({chapter: 2});
    expect(toJson(wrapper)).toMatchSnapshot();
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
