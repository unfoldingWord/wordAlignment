import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as CommentsActions from '../CommentsActions';
import Api from "../../../Api";
import {
  generateTimestamp,
  writeCheckData,
} from '../../../utils/CheckDataHelper';

jest.mock('../../../utils/CheckDataHelper');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('addComment()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should work', () => {
    // given
    const comment = 'new comment';
    const userName = 'user name';
    const bookId = 'tit';
    const chapter = 1;
    const verse = 2;
    const contextId = { reference: { bookId, chapter, verse }};
    const timeStamp = `2019-10-28T15_34_35.875Z`;
    generateTimestamp.mockReturnValue(timeStamp);
    const expectedActions = [
      {
        "type": "WA::ADD_COMMENT",
        "text": "new comment",
        "userName": "user name",
        "contextId": {
          "reference": {
            "bookId": "tit",
            "chapter": 1,
            "verse": 2
          }
        },
        "modifiedTimestamp": "2019-10-28T15_34_35.875Z",
      },
      {
        "type": "WA::SET_GROUP_MENU_COMMENT",
        "value": "new comment",
        "chapter": 1,
        "verse": 2,
      }
    ];
    const expectedNewData = {
      text: comment,
      userName: userName,
      activeBook: bookId,
      activeChapter: chapter,
      activeVerse: verse,
      contextId,
    };
    const store = mockStore();
    const api = new Api();
    api.context = { store };
    api.props = {
      tc: {
        targetBook: {
          1: {
            1: "hello"
          }
        },
        contextId,
      },
    };

    // when
    store.dispatch(CommentsActions.addComment(api, comment, userName, contextId));

    // then
    const actions = store.getActions();
    expect(actions).toEqual(expectedActions);
    expect(writeCheckData).toBeCalledWith(api, 'comments', chapter, verse, expectedNewData, timeStamp);
  });
});
