import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { loadNewContext } from '../CheckDataActions';
import Api from "../../../Api";
import { getVerseBookmarkedRecord, getVerseCommentRecord} from "../../../utils/CheckDataHelper";

jest.mock('../../../utils/CheckDataHelper');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('loadNewContext()', () => {
  it('should work', () => {
    // given
    const commentData = { loadData: 'comment' };
    getVerseCommentRecord.mockReturnValue(commentData);
    const reminderData = { loadData: 'reminder' };
    getVerseBookmarkedRecord.mockReturnValue(reminderData);
    const expectedActions = [
      {
        "type": "WA::LOAD_COMMENT",
        "value": {
          "loadData": "comment"
        }
      },
      {
        "type": "WA::LOAD_REMINDER",
        "value": {
          "loadData": "reminder"
        }
      }
    ];
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
        writeProjectData: jest.fn(() => Promise.resolve()),
        contextId: {reference: {bookId: 'tit', chapter: 1, verse: 2}}
      },
      tool: {
        isReady: false
      }
    };

    // when
    loadNewContext(api, api.props.tc.contextId);

    // then
    const actions = store.getActions();
    expect(actions).toEqual(expectedActions);
  });
});
