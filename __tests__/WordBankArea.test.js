/* eslint-env jest */

import React, { Component } from 'react';
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import WordBankArea from '../src/components/WordBankArea';
import WordBankItem from '../src/components/WordBankItem';

test('WordBankItem renders', () => {
    const component = renderer.create(
        <WordBankArea />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});

describe('WordBankArea', () => {
  let contextIdReducer ,wordAlignmentReducer, connectDropTarget;
  const luke1 = require('./fixtures/luke/1.json');

  beforeEach(() => {
    contextIdReducer = {
      "contextId": {
        "groupId": "figs_metaphor",
        "occurrence": 1,
        "quote": "that he put before them",
        "information": "Paul speaks about good deeds as if they were objects that God could place in front of people. AT: \"that God prepared for them to do\" (See: [[:en:ta:vol1:translate:figs_metaphor]]) \n",
        "reference": {
          "bookId": "luk",
          "chapter": 1,
          "verse": 1
        },
        "tool": "TranslationNotesChecker"
      }
    };
    wordAlignmentReducer = {
      alignmentData: {
        "1": luke1
      }
    };
    connectDropTarget = div => {
      return div;
    };
  });

  test('WordBankArea renders Luke 1:1', () => {
    const chapter = "1";
    const verse = "1";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;
    const expectedWords = wordAlignmentReducer.alignmentData[chapter][verse].wordBank.length;
    const WordBankAreaContext = wrapInTestContext(WordBankArea);
    let root = TestUtils.renderIntoDocument(
      <WordBankAreaContext
        wordAlignmentReducer={wordAlignmentReducer}
        contextIdReducer={contextIdReducer}
        connectDropTarget={connectDropTarget}
        isOver={false}
      />
    );

    let wordBankItems = TestUtils.scryRenderedComponentsWithType(root, WordBankItem);
    expect(wordBankItems).toBeTruthy();
    expect(wordBankItems.length).toEqual(expectedWords);
  });

  test('WordBankArea renders undefined Luke 1:81 without crashing', () => {
    const chapter = "1";
    const verse = "81";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;
    const expectedWords = 0;
    const WordBankAreaContext = wrapInTestContext(WordBankArea);
    let root = TestUtils.renderIntoDocument(
      <WordBankAreaContext
        wordAlignmentReducer={wordAlignmentReducer}
        contextIdReducer={contextIdReducer}
        connectDropTarget={connectDropTarget}
        isOver={false}
      />
    );

    let wordBankItems = TestUtils.scryRenderedComponentsWithType(root, WordBankItem);
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
    }
  );
}
