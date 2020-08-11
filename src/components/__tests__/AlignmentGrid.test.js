import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import {Token} from 'wordmap-lexer';
import AlignmentGrid from '../AlignmentGrid';

test('empty snapshot', () => {
  const wrapper = renderer.create(
    <AlignmentGrid lexicons={{}}
                   alignments={[]}
                   onAcceptTokenSuggestion={jest.fn()}
                   onDropSourceToken={jest.fn()}
                   onCancelSuggestion={jest.fn()}
                   onDropTargetToken={jest.fn()}
                   translate={k => k}
                   toolsSettings={{}}
                   actions={{
                     showPopover: jest.fn(),
                     loadLexiconEntry: jest.fn(),
                     getLexiconData: jest.fn()
                   }}
                   />
  );
  expect(wrapper).toMatchSnapshot();
});

describe('AlignmentGrid', () => {
  let contextId, alignmentData;

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
      '1': {
        '1': [
          {
            'position': 0,
            'index': 0,
            'isSuggestion': false,
            'sourceNgram': [
              new Token({
                'text': 'ἐπειδήπερ',
                'strongs': 'G18950',
                'lemma': 'ἐπειδήπερ',
                'morph': 'Gr,CS,,,,,,,,',
                'occurrence': 1,
                'occurrences': 1
              })
            ],
            'targetNgram': []
          },
          {
            'position': 1,
            'index': 1,
            'isSuggestion': false,
            'sourceNgram': [
              new Token({
                'text': 'πολλοὶ',
                'strongs': 'G41830',
                'lemma': 'πολλός',
                'morph': 'Gr,RI,,,,NMP,',
                'occurrence': 1,
                'occurrences': 1
              })
            ],
            'targetNgram': []
          },
          {
            'position': 2,
            'index': 2,
            'isSuggestion': false,
            'sourceNgram': [
              new Token({
                'text': 'ἐπεχείρησαν',
                'strongs': 'G20210',
                'lemma': 'ἐπιχειρέω',
                'morph': 'Gr,V,IAA3,,P,',
                'occurrence': 1,
                'occurrences': 1
              })
            ],
            'targetNgram': []
          }
        ]
      }
    };
  });

  test('renders Luke 1:1', () => {
    // given
    contextId.reference.chapter = '1';
    contextId.reference.verse = '1';
    const ConnectedAlignmentGrid = wrapInTestContext(AlignmentGrid);
    const wrapper = renderer.create(
      <ConnectedAlignmentGrid
        alignments={alignmentData['1']['1']}
        contextId={contextId}
        onAcceptTokenSuggestion={jest.fn()}
        onDropSourceToken={jest.fn()}
        onDropTargetToken={jest.fn()}
        onCancelSuggestion={jest.fn()}
        toolsSettings={{}}
        translate={k => k}
        actions={{
          showPopover: jest.fn(),
          loadLexiconEntry: jest.fn(),
          getLexiconData: jest.fn()
        }}
        lexicons={{}}
      />
    );

    // then
    expect(wrapper).toMatchSnapshot();
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
        onAcceptTokenSuggestion={jest.fn()}
        alignments={alignmentData['1']['1']}
        contextId={contextId}
        onDropSourceToken={jest.fn()}
        onCancelSuggestion={jest.fn()}
        onDropTargetToken={jest.fn()}
        translate={k => k}
        actions={{
          showPopover: jest.fn(),
          loadLexiconEntry: jest.fn(),
          getLexiconData: jest.fn()
        }}
        lexicons={{}}
        toolsSettings={{}}
      />
    );

    // then
    const dropBoxArea = enzymeWrapper.find('div');
    expect(dropBoxArea).toBeTruthy();
    expect(dropBoxArea.getElements().length).toEqual(expectedWords + 1);
  });
});

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
