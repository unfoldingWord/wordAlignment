import React from 'react';
import renderer from 'react-test-renderer';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import AlignmentCard from '../AlignmentCard';
import WordCard from '../../WordCard';

const singleTopWord = [
  <WordCard key={1} word="topWord" />,
];

const singleBottomWord = [
  <WordCard key={1} word="bottomWord" occurrence={1} occurrences={2}  />
];

const multipleTopWords = [
  <WordCard key={1} word="topWord1" />,
  <WordCard key={2} word="topWord2" />
];

const multipleBottomWords = [
  <WordCard key={1} word="bottomWord1" />,
  <WordCard key={2} word="bottomWord2" occurrence={1} occurrences={2} />
];

it('is empty', () => {
  testSnapshot();
});
it('has a top word', () => {
  testSnapshot({
    sourceTokenCards: singleTopWord
  });
});
it('has a top and bottom word', () => {
  testSnapshot({
    sourceTokenCards: singleTopWord,
    targetTokenCards: singleBottomWord
  });
});
it('has a bottom word', () => {
  testSnapshot({
    targetTokenCards: singleBottomWord
  });
});
it('has multiple top words', () => {
  testSnapshot({
    sourceTokenCards: multipleTopWords
  });
});
it('has multiple top and bottom words', () => {
  testSnapshot({
    sourceTokenCards: multipleTopWords,
    targetTokenCards: multipleBottomWords
  });
});
it('has multiple bottom words', () => {
  testSnapshot({
    targetTokenCards: multipleBottomWords
  });
});

/**
 * Tests the snapshot against some props
 * @param props
 */
function testSnapshot(props={}) {
  const ConnectedAlignmentCard = wrapInTestContext(AlignmentCard);
  const wrapper = renderer.create(
    <ConnectedAlignmentCard onDrop={jest.fn()}
                            lexicons={{}}
                            alignmentIndex={0}
                            targetTokenCards={[]}
                            sourceTokenCards={[]}
                            {...props}/>
  );
  expect(wrapper).toMatchSnapshot();
}

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends React.Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}
