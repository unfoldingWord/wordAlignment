import React from 'react';
import DropBoxArea from '../src/components/DropBoxArea';
import {shallow} from 'enzyme';
import renderer from 'react-test-renderer';

test('DropBoxArea renders', () => {
    const component = renderer.create(
        <DropBoxArea />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});

describe('DropBoxArea', () => {
  let contextIdReducer ,wordAlignmentReducer, resourcesReducer;
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
    resourcesReducer = {
      lexicons: {}
    };
  });

  test('DropBoxArea renders Luke 1:1', () => {
    // given
    const chapter = "1";
    const verse = "1";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;
    const expectedWords = wordAlignmentReducer.alignmentData[chapter][verse].alignments.length;

    // when
    const enzymeWrapper = shallow(
      <DropBoxArea
        wordAlignmentReducer={wordAlignmentReducer}
        contextIdReducer={contextIdReducer}
        actions={{}}
        resourcesReducer={resourcesReducer}
      />
    );

    // then
    const dropBoxArea = enzymeWrapper.find('div');
    expect(dropBoxArea).toBeTruthy();
    expect(dropBoxArea.nodes.length).toEqual(expectedWords + 1);
  });

  test('DropBoxArea renders undefined Luke 1:81 without crashing', () => {
    // given
    const chapter = "1";
    const verse = "81";
    contextIdReducer.contextId.reference.chapter = chapter;
    contextIdReducer.contextId.reference.verse = verse;
    const expectedWords = 0;

    // when
    const enzymeWrapper = shallow(
      <DropBoxArea
        wordAlignmentReducer={wordAlignmentReducer}
        contextIdReducer={contextIdReducer}
        actions={{}}
        resourcesReducer={resourcesReducer}
      />
    );

    // then
    const dropBoxArea = enzymeWrapper.find('div');
    expect(dropBoxArea).toBeTruthy();
    expect(dropBoxArea.nodes.length).toEqual(expectedWords + 1);
  });
});
