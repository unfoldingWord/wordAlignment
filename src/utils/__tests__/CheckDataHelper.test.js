import _ from "lodash";
import fs from 'fs-extra';
import path from "path-extra";
import {generateCheckPath, loadCheckData} from "../CheckDataHelper";

const testRecord = {
  "tags": [
    "other"
  ],
  "userName": "dummy",
  "activeBook": "tit",
  "activeChapter": 2,
  "activeVerse": 1,
  "modifiedTimestamp": "2019-12-31T19:00:39.737Z",
  "gatewayLanguageCode": "en",
  "gatewayLanguageQuote": "",
  "contextId": {
    "reference": {
      "bookId": "tit",
      "chapter": 2,
      "verse": 4
    },
    "tool": "wordAlignment",
    "groupId": "chapter_2"
  }
};

describe('CheckDataHelper()', () => {
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
          contextId: _.cloneDeep(testRecord.contextId)
        }
      }
    };
    toolName = 'wordAlignment';
  });

  it('should not crash with no files', () => {
    // given
    const checkType = 'comments';
    const chapter = 2;
    const verse = 4;

    // when
    const data = loadCheckData(api, checkType, chapter, verse, toolName);

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
    let fileName2 = testRecord.modifiedTimestamp + ".json";
    fileName2 = fileName2.replace('2019-', '2020-');
    const testRecord2 = _.cloneDeep(testRecord);
    testRecord2.text = expectedText;
    fs.outputJsonSync(path.join(folder, fileName2), testRecord2);
    const fileName1 = testRecord.modifiedTimestamp + ".json";
    const testRecord1 = _.cloneDeep(testRecord);
    testRecord1.text = 'old';
    fs.outputJsonSync(path.join(folder, fileName1), testRecord1);

    // when
    const data = loadCheckData(api, checkType,  chapter, verse, toolName);

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
    let fileName2 = testRecord.modifiedTimestamp + ".json";
    fileName2 = fileName2.replace('2019-', '2020-');
    const testRecord2 = _.cloneDeep(testRecord);
    testRecord2.text = 'ta stuff';
    testRecord2.contextId.tool = 'translationNotes';
    fs.outputJsonSync(path.join(folder, fileName2), testRecord2);
    const fileName1 = testRecord.modifiedTimestamp + ".json";
    const testRecord1 = _.cloneDeep(testRecord);
    testRecord1.text = expectedText;
    fs.outputJsonSync(path.join(folder, fileName1), testRecord1);

    // when
    const data = loadCheckData(api, checkType,  chapter, verse, toolName);

    // then
    expect(data.text).toEqual(expectedText);
  });
});
