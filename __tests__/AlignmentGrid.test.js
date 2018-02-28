import React from 'react';
import AlignmentGrid from '../src/components/AlignmentGrid';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';

test('snapshot', () => {
  const wrapper = renderer.create(
    <AlignmentGrid lexicons={{}}
                   actions={{}}/>
  );
  expect(wrapper).toMatchSnapshot();
});

describe('AlignmentGrid', () => {
  let contextId, alignmentData;
  const luke1 = require('./fixtures/luke/1.json');

  beforeEach(() => {

    contextId = {
      'groupId': 'figs_metaphor',
      'occurrence': 1,
      'quote': 'that he put before them',
      'information': 'Paul speaks about good deeds as if they were objects that God could place in front of people. AT: "that God prepared for them to do" (See: [[:en:ta:vol1:translate:figs_metaphor]]) \n',
      'reference': {
        'bookId': 'luk',
        'chapter': 1,
        'verse': 1
      },
      'tool': 'TranslationNotesChecker'
    };
    alignmentData = {
      '1': luke1
    };
  });

  test('renders Luke 1:1', () => {
    // given
    const chapter = '1';
    const verse = '1';
    contextId.reference.chapter = chapter;
    contextId.reference.verse = verse;
    const expectedWords = alignmentData[chapter][verse].alignments.length;

    // when
    const enzymeWrapper = shallow(
      <AlignmentGrid
        alignmentData={alignmentData}
        contextId={contextId}
        actions={{}}
        lexicons={{}}
      />
    );

    // then
    const dropBoxArea = enzymeWrapper.find('div');
    expect(dropBoxArea).toBeTruthy();
    expect(dropBoxArea.getElements().length).toEqual(expectedWords + 1);
  });

  test('renders undefined Luke 1:81 without crashing', () => {
    // given
    const chapter = '1';
    const verse = '81';
    contextId.reference.chapter = chapter;
    contextId.reference.verse = verse;
    const expectedWords = 0;

    // when
    const enzymeWrapper = shallow(
      <AlignmentGrid
        alignmentData={alignmentData}
        contextId={contextId}
        actions={{}}
        lexicons={{}}
      />
    );

    // then
    const dropBoxArea = enzymeWrapper.find('div');
    expect(dropBoxArea).toBeTruthy();
    expect(dropBoxArea.getElements().length).toEqual(expectedWords + 1);
  });
});
