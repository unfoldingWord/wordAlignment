import React from 'react';
import renderer from 'react-test-renderer';
import AlignmentCard from '../AlignmentCard';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';

test('empty alignment', () => {
  const ConnectedAlignment = wrapInTestContext(AlignmentCard);
  const wrapper = renderer.create(
    <ConnectedAlignment topWords={[]}
                        bottomWords={[]}
                        onDrop={jest.fn()}
                        lexicons={{}}
                        alignmentIndex={0}/>
  );
  expect(wrapper).toMatchSnapshot();
});

test('filled alignment', () => {
  const ConnectedAlignment = wrapInTestContext(AlignmentCard);
  const wrapper = renderer.create(
    <ConnectedAlignment topWords={[]}
                        bottomWords={[]}
                        onDrop={jest.fn()}
                        lexicons={{}}
                        alignmentIndex={0}/>
  );
  expect(wrapper).toMatchSnapshot();
});


// TODO: test with something in it.


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
