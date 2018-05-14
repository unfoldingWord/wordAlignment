/* eslint-env jest */
import React, {Component} from 'react';
import TestBackend from 'react-dnd-test-backend';
import {DragDropContext} from 'react-dnd';
import expect from 'expect';
import Container from '../Container';
import {mount} from 'enzyme';
import toJson from 'enzyme-to-json';
import {connectTool} from 'tc-tool';

test('Container renders', () => {
  const props = {
    actions: {
      setToolSettings: jest.fn(),
      getWordListForVerse: jest.fn(),
      loadLexiconEntry: jest.fn(),
      showPopover: jest.fn()
    },
    settingsReducer: {
      toolsSettings: {
        ScripturePane: {
          currentPaneSettings: []
        }
      }
    },
    selectionsReducer: {
      selections: [{text: 'text'}]
    },
    projectDetailsReducer: {},
    contextIdReducer: {},
    currentToolViews: {},
    resourcesReducer: {
      bibles: [],
      lexicons: {}
    },
    wordAlignmentReducer: {
      alignmentData: {}
    },
    appLanguage: 'en',
    tc: {
      sourceChapter: {},
      targetChapter: {},
      showDialog: jest.fn(),
      writeGlobalToolData: jest.fn(),
      readGlobalToolData: jest.fn(),
      appLanguage: 'en',
      showLoading: jest.fn(),
      closeLoading: jest.fn()
    },
    translate: k => k
  };

  const WrappedContainer = wrapInTestContext(Container);
  const wrapper = mount(<WrappedContainer {...props} />);
  expect(toJson(wrapper)).toMatchSnapshot();
});

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
  class TestContextContainer extends Component {
    render() {
      return <DecoratedComponent {...this.props} />;
    }
  }

  return DragDropContext(TestBackend)(connectTool()(TestContextContainer).container);
}
