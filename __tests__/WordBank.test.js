/* eslint-env jest */

jest.unmock('react-dnd');

import React, {Component} from 'react';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import WordBank from '../src/components/WordBank/WordBank';
import Word from '../src/components/Word';
import renderer from 'react-test-renderer';

const alignmentData = {
  '1': require('./fixtures/luke/1.json')
};

describe('snapshot', () => {
  it('has no alignment data', () => {
    const wrapper = renderer.create(
      <WordBank isOver={false}
                alignmentData={{}}
                verse="1"
                chapter="1"/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('has no reference', () => {
    const wrapper = renderer.create(
      <WordBank isOver={false}
                alignmentData={{}}
                verse=""
                chapter=""/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('has data and reference', () => {
    const WrappedWordBank = wrapInTestContext(WordBank);
    const wrapper = renderer.create(
      <WrappedWordBank isOver={false}
                alignmentData={alignmentData}
                verse="1"
                chapter="1"/>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

describe('WordBank', () => {
  let connectDropTarget;

  beforeEach(() => {
    connectDropTarget = div => {
      return div;
    };
  });

  test('renders Luke 1:1', () => {
    // given
    const chapter = '1';
    const verse = '1';
    const expectedWords = alignmentData[chapter][verse].wordBank.length;
    const WordBankContext = wrapInTestContext(WordBank);

    // when
    let root = TestUtils.renderIntoDocument(
      <WordBankContext
        chapter={chapter}
        verse={verse}
        alignmentData={alignmentData}
        connectDropTarget={connectDropTarget}
        isOver={false}
      />,
    );

    // then
    let wordBankItems = TestUtils.scryRenderedComponentsWithType(root, Word);
    expect(wordBankItems).toBeTruthy();
    expect(wordBankItems.length).toEqual(expectedWords);
  });

  test('renders undefined Luke 1:81 without crashing', () => {
    // given
    const expectedWords = 0;
    const WordBankContext = wrapInTestContext(WordBank);

    // when
    let root = TestUtils.renderIntoDocument(
      <WordBankContext
        chapter="1"
        verse="81"
        alignmentData={alignmentData}
        connectDropTarget={connectDropTarget}
        isOver={false}
      />,
    );

    // then
    let wordBankItems = TestUtils.scryRenderedComponentsWithType(root, Word);
    expect(wordBankItems).toBeTruthy();
    expect(wordBankItems.length).toEqual(expectedWords);
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
    },
  );
}
