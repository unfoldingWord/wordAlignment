import React from 'react';
import renderer from 'react-test-renderer';
import AlignmentCard from '../AlignmentCard';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
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
    topWordCards: singleTopWord
  });
});
it('has a top and bottom word', () => {
  testSnapshot({
    topWordCards: singleTopWord,
    bottomWordCards: singleBottomWord
  });
});
it('has a bottom word', () => {
  testSnapshot({
    bottomWordCards: singleBottomWord
  });
});
it('has multiple top words', () => {
  testSnapshot({
    topWordCards: multipleTopWords
  });
});
it('has multiple top and bottom words', () => {
  testSnapshot({
    topWordCards: multipleTopWords,
    bottomWordCards: multipleBottomWords
  });
});
it('has multiple bottom words', () => {
  testSnapshot({
    bottomWordCards: multipleBottomWords
  });
});

/**
 * Tests the snapshot against some props
 * @param props
 */
function testSnapshot(props={}) {
  const ConnectedAlignmentCard = wrapInTestContext(AlignmentCard);
  const wrapper = renderer.create(
    <ConnectedAlignmentCard topWords={[]}
                            bottomWords={[]}
                            onDrop={jest.fn()}
                            lexicons={{}}
                            alignmentIndex={0}
                            bottomWordCards={[]}
                            topWordCards={[]}
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
