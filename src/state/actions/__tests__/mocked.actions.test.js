import {Token} from 'wordmap-lexer';
import {areAlignmentsEquivalent} from '../../../utils/alignmentValidation';
import * as reducers from '../../reducers';
import * as actions from '../index';
jest.mock('../../reducers');
jest.mock('../../../utils/alignmentValidation');

describe('repair and inspect verse', () => {

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('changes alignments', () => {
    reducers.__setVerseAlignmentsOnce([1, 2]);
    reducers.__setVerseAlignmentsOnce([0, 1]); // change
    const action = actions.repairAndInspectVerse(1, 1,
      [new Token({text: 'hello'}).toJSON()],
      [new Token({text: 'olleh'}).toJSON()]);

    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockReturnValueOnce([1, 2]);
    getState.mockReturnValueOnce([1]);
    action(dispatch, getState);
    expect(areAlignmentsEquivalent).toHaveBeenCalledTimes(1);
    expect(getState).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('does not change alignments', () => {
    reducers.__setVerseAlignmentsOnce([1, 2]);
    reducers.__setVerseAlignmentsOnce([1, 2]);
    const action = actions.repairAndInspectVerse(1, 1,
      [new Token({text: 'hello'}).toJSON()],
      [new Token({text: 'olleh'}).toJSON()]);

    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockReturnValueOnce([1, 2]);
    getState.mockReturnValueOnce([1]);
    action(dispatch, getState);
    expect(areAlignmentsEquivalent).toHaveBeenCalledTimes(1);
    expect(getState).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
