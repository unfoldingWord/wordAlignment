import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as GroupMenuActions from '../GroupMenuActions';
import Api from "../../../Api";
import * as CheckDataHelper from '../../../utils/CheckDataHelper';
import * as Reducers from '../../reducers';

jest.mock('../../../utils/CheckDataHelper');
jest.mock('../../reducers');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('thunk actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loadGroupMenuItem()', () => {
    Reducers.getGroupMenuItem.mockReturnValue(null);
    const expectedFinished = false;
    CheckDataHelper.getIsVerseFinished.mockReturnValue(expectedFinished);
    const expectedInvalid = true;
    CheckDataHelper.getIsVerseInvalid.mockReturnValue(expectedInvalid);
    const expectedAligned = false;
    Reducers.getIsVerseAligned.mockReturnValue(expectedAligned);
    const expectedIsVerseEdited = true;
    CheckDataHelper.getIsVerseEdited.mockReturnValue(expectedIsVerseEdited);
    const expectedBookmarked = false;
    CheckDataHelper.getVerseBookmarked.mockReturnValue(expectedBookmarked);
    const expectedComment = 'new comment!';
    CheckDataHelper.getVerseComment.mockReturnValue(expectedComment);
    const api = new Api();
    const chapter = 3;
    const verse = 2;
    api.props = {
      tc: {
        targetBook: {
          1: {
            1: "hello"
          }
        },
        writeProjectData: jest.fn(() => Promise.resolve()),
        contextId: {reference: {bookId: 'tit', chapter, verse}}
      },
      tool: {
        isReady: false
      }
    };
    const expectedActions = [
      {
        type: 'WA::SET_GROUP_MENU_STATE',
        chapter,
        verse,
        "values": {
          "bookMarked": expectedBookmarked,
          "comment": expectedComment,
          "edited": expectedIsVerseEdited,
          "finished": expectedFinished,
          "invalid": expectedInvalid,
          "unaligned": !expectedAligned,
        },
      }
    ];
    const store = mockStore();
    store.dispatch(GroupMenuActions.loadGroupMenuItem(api, chapter, verse));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('setGroupMenuItemFinished()', () => {
    const finished = true;
    const expectedActions = [
      {"type": "WA::SET_GROUP_MENU_FINISHED", "chapter": 2, "verse": 5, "value": finished}
    ];
    const store = mockStore();
    const action = GroupMenuActions.setGroupMenuItemFinished(2, 5, finished);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('setGroupMenuItemInvalid()', () => {
    const invalid = true;
    const expectedActions = [
      {"type": "WA::SET_GROUP_MENU_INVALID", "chapter": 2, "verse": 7, "value": invalid}
    ];
    const store = mockStore();
    const action = GroupMenuActions.setGroupMenuItemInvalid(2, 7, invalid);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('setGroupMenuItemUnaligned()', () => {
    const unaligned = false;
    const expectedActions = [
      {"type": "WA::SET_GROUP_MENU_UNALIGNED", "chapter": 3, "verse": 7, "value": unaligned}
    ];
    const store = mockStore();
    const action = GroupMenuActions.setGroupMenuItemUnaligned(3, 7, unaligned);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('setGroupMenuItemEdited()', () => {
    const edited = false;
    const expectedActions = [
      {"type": "WA::SET_GROUP_MENU_EDITED", "chapter": 3, "verse": 7, "value": edited}
    ];
    const store = mockStore();
    const action = GroupMenuActions.setGroupMenuItemEdited(3, 7, edited);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('setGroupMenuItemState()', () => {
    const values = {edited: false};
    const expectedActions = [
      {"type": "WA::SET_GROUP_MENU_STATE", "chapter": 3, "verse": 7, "values": values}
    ];
    const store = mockStore();
    const action = GroupMenuActions.setGroupMenuItemState(3, 7, values);
    store.dispatch(action);
    expect(store.getActions()).toEqual(expectedActions);
  });
});
