import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path-extra';
import Api from '../../Api';
import {
  generateCheckPath,
  getIsVerseEdited,
  getIsVerseFinished,
  getIsVerseInvalid,
  getVerseComment,
  loadCheckData,
} from '../CheckDataHelper';

jest.mock('../../state/reducers');

const testRecord = {
  'tags': [
    'other',
  ],
  'userName': 'dummy',
  'activeBook': 'tit',
  'activeChapter': 2,
  'activeVerse': 1,
  'modifiedTimestamp': '2019-12-31T19:00:39.737Z',
  'gatewayLanguageCode': 'en',
  'gatewayLanguageQuote': '',
  'contextId': {
    'reference': {
      'bookId': 'tit',
      'chapter': 2,
      'verse': 4,
    },
    'tool': 'wordAlignment',
    'groupId': 'chapter_2',
  },
};

describe('loadCheckData()', () => {
  let api;
  let toolName;

  beforeEach(() => {
    fs.__resetMockFS();
    api = {
      props: {
        tc: {
          projectDataPathExistsSync: fs.existsSync,
          readProjectDataSync: fs.readFileSync,
          readProjectDirSync: fs.readdirSync,
          project: { readCurrentContextIdSync: () => _.cloneDeep(testRecord.contextId) },
        },
        contextId: _.cloneDeep(testRecord.contextId),
      },
    };
    toolName = 'wordAlignment';
  });

  it('should not crash with no files', () => {
    // given
    const checkType = 'comments';

    // when
    const data = loadCheckData(api.props.contextId, checkType, toolName);

    // then
    expect(data).toBeFalsy();
  });

  it('with two files should read most recent', () => {
    // given
    const checkType = 'comments';
    const chapter = 2;
    const verse = 4;
    const expectedText = 'new stuff';
    const bookId = testRecord.contextId.reference.bookId;
    const folder = generateCheckPath(checkType, bookId, chapter, verse);
    fs.ensureDirSync(folder);
    let fileName2 = testRecord.modifiedTimestamp + '.json';
    fileName2 = fileName2.replace('2019-', '2020-');
    const testRecord2 = _.cloneDeep(testRecord);
    testRecord2.text = expectedText;
    fs.outputJsonSync(path.join(folder, fileName2), testRecord2);
    const fileName1 = testRecord.modifiedTimestamp + '.json';
    const testRecord1 = _.cloneDeep(testRecord);
    testRecord1.text = 'old';
    fs.outputJsonSync(path.join(folder, fileName1), testRecord1);

    // when
    const data = loadCheckData(api.props.contextId, checkType, toolName);

    // then
    expect(data.text).toEqual(expectedText);
  });

  it('with two files should skip files from different tool', () => {
    // given
    const checkType = 'comments';
    const chapter = 2;
    const verse = 4;
    const expectedText = 'wa stuff';
    const bookId = testRecord.contextId.reference.bookId;
    const folder = generateCheckPath(checkType, bookId, chapter, verse);
    fs.ensureDirSync(folder);
    let fileName2 = testRecord.modifiedTimestamp + '.json';
    fileName2 = fileName2.replace('2019-', '2020-');
    const testRecord2 = _.cloneDeep(testRecord);
    testRecord2.text = 'ta stuff';
    testRecord2.contextId.tool = 'translationNotes';
    fs.outputJsonSync(path.join(folder, fileName2), testRecord2);
    const fileName1 = testRecord.modifiedTimestamp + '.json';
    const testRecord1 = _.cloneDeep(testRecord);
    testRecord1.text = expectedText;
    fs.outputJsonSync(path.join(folder, fileName1), testRecord1);

    // when
    const data = loadCheckData(api.props.contextId, checkType, toolName);

    // then
    expect(data.text).toEqual(expectedText);
  });
});

describe('getIsVerseEdited()', () => {
  it('should return that a verse has verse edits', () => {
    // given
    const chapter = 10;
    const verse = 11;
    const expectedHasVerseEdits = true;
    let bookId = 'luk';
    const props = {
      tc: {
        projectDataPathExistsSync: () => expectedHasVerseEdits,
        targetBook: {},
        project: { readCurrentContextIdSync: () => ({ reference: { bookId: bookId } }) },
      },
      contextId: { reference: { bookId: bookId } },
    };
    const api = new Api();
    api.props = props;

    // when
    const hasVerseEdits = getIsVerseEdited(api, chapter, verse);

    // then
    expect(hasVerseEdits).toBe(expectedHasVerseEdits);
  });

  it('should return that a verse does not have verse edits', () => {
    // given
    const bookId = 'luk';
    const chapter = 10;
    const verse = 11;
    const expectedHasVerseEdits = false;
    const props = {
      tc: {
        projectDataPathExistsSync: () => expectedHasVerseEdits,
        targetBook: {},
        project: { readCurrentContextIdSync: () => ({ reference: { bookId: bookId } }) },
      },
      contextId: { reference: { bookId } },
    };
    const api = new Api();
    api.props = props;

    // when
    const hasVerseEdits = getIsVerseEdited(api, chapter, verse);

    // then
    expect(hasVerseEdits).toBe(expectedHasVerseEdits);
  });
});

describe('getIsVerseFinished()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is not finished', () => {
    const api = new Api();
    const fileExists = false;

    api.props = { tool: { toolDataPathExistsSync: jest.fn(() => fileExists) } };
    expect(getIsVerseFinished(api, 1, 1)).toEqual(fileExists);
  });

  it('is finished', () => {
    const api = new Api();
    const fileExists = true;

    api.props = { tool: { toolDataPathExistsSync: jest.fn(() => fileExists) } };
    expect(getIsVerseFinished(api, 1, 1)).toEqual(fileExists);
  });
});

describe('getIsVerseInvalid()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is not invalid', () => {
    const api = new Api();
    const fileExists = false;

    api.props = { tool: { toolDataPathExistsSync: jest.fn(() => fileExists) } };
    expect(getIsVerseInvalid(api, 1, 2)).toEqual(fileExists);
    expect(api.props.tool.toolDataPathExistsSync).toBeCalledWith('invalid/1/2.json');
  });

  it('is invalid', () => {
    const api = new Api();
    const fileExists = true;

    api.props = { tool: { toolDataPathExistsSync: jest.fn(() => fileExists) } };
    expect(getIsVerseInvalid(api, 2, 3)).toEqual(fileExists);
    expect(api.props.tool.toolDataPathExistsSync).toBeCalledWith('invalid/2/3.json');
  });
});

describe('getVerseComment()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no comment directory', () => {
    // given
    const api = new Api();
    const expectedComment = '';
    const folderData = ['time1.json'];
    const commentData = _.cloneDeep(testRecord);
    let bookId = 'bookID';
    const contextId = { reference: { bookId: bookId, chapter: 1, verse: 2 } };

    api.props = {
      contextId,
      tc: { project: { readCurrentContextIdSync: () => contextId } },
    };
    // mocking fs methods
    jest.mock('fs-extra');
    fs.existsSync = jest.fn(() => !!folderData.length);
    fs.readdirSync = jest.fn(() => _.cloneDeep(folderData));
    fs.readJsonSync = jest.fn(() => JSON.stringify(commentData));

    // when
    const verseComment = getVerseComment(contextId);

    // then
    expect(verseComment).toEqual(expectedComment);
    expect(fs.existsSync).toBeCalledWith('checkData/comments/bookID/1/2');
  });

  it('saved comment', () => {
    // given
    const api = new Api();
    const expectedComment = 'my comment';
    const folderData = ['time1.json'];
    const commentData = _.cloneDeep(testRecord);
    commentData.text = expectedComment;
    const bookId = 'bookID';
    const contextId = { reference: { bookId: bookId, chapter: 2, verse: 3 }, tool: 'wordAlignment' };

    api.props = {
      contextId,
      tc: { project: { readCurrentContextIdSync: () => contextId } },
    };

    // mocking fs methods
    jest.unmock('fs-extra');
    jest.mock('fs-extra');
    fs.existsSync = jest.fn(() => !!folderData.length);
    fs.readdirSync = jest.fn(() => _.cloneDeep(folderData));
    fs.readJsonSync = jest.fn(() => commentData);

    // when
    const verseComment = getVerseComment(contextId);

    // then
    expect(verseComment).toEqual(expectedComment);
    expect(fs.existsSync).toBeCalledWith('checkData/comments/bookID/2/3');
  });

  it('saved comment for different tool', () => {
    // given
    const api = new Api();
    const expectedComment = '';
    const folderData = ['time1.json'];
    const commentData = _.cloneDeep(testRecord);
    commentData.text = expectedComment;
    commentData.contextId.tool = 'OtherTool';
    const bookId = 'bookID';
    const contextId = { reference: { bookId: bookId, chapter: 3, verse: 4 } };

    api.props = {
      contextId,
      tc: { project: { readCurrentContextIdSync: () => contextId } },
    };

    // mocking fs methods
    jest.unmock('fs-extra');
    jest.mock('fs-extra');
    fs.existsSync = jest.fn(() => !!folderData.length);
    fs.readdirSync = jest.fn(() => _.cloneDeep(folderData));
    fs.readJsonSync = jest.fn(() => commentData);


    // when
    const verseComment = getVerseComment(contextId);

    // then
    expect(verseComment).toEqual(expectedComment);
    expect(fs.existsSync).toBeCalledWith('checkData/comments/bookID/3/4');
  });

  it('saved comment invalid json', () => {
    // given
    const api = new Api();
    const expectedComment = '';
    const folderData = ['time1.json'];
    let bookId = 'bookID';
    const contextId = { reference: { bookId: bookId, chapter: 4, verse: 5 } };

    api.props = {
      contextId,
      tc: { project: { readCurrentContextIdSync: () => contextId } },
    };

    // mocking fs methods
    jest.unmock('fs-extra');
    jest.mock('fs-extra');
    fs.existsSync = jest.fn(() => !!folderData.length);
    fs.readdirSync = jest.fn(() => _.cloneDeep(folderData));
    fs.readJsonSync = jest.fn(() => '{ missing');


    // when
    const verseComment = getVerseComment(contextId);

    // then
    expect(verseComment).toEqual(expectedComment);
    expect(fs.existsSync).toBeCalledWith('checkData/comments/bookID/4/5');
  });
});
