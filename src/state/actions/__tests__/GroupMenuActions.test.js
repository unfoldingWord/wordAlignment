import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as GroupMenuActions from '../GroupMenuActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('thunk actions', () => {

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
