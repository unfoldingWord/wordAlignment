import path from 'path-extra';
import ospath from 'ospath';

// Paths
export const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore', 'resources');
export const PROJECT_DOT_APPS_PATH = path.join('.apps', 'translationCore');
export const PROJECT_CHECKDATA_DIRECTORY = path.join(PROJECT_DOT_APPS_PATH, 'checkData');
export const PROJECT_INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
// String names
export const SOURCE_CONTENT_UPDATER_MANIFEST = 'source-content-updater-manifest.json';
export const WORD_ALIGNMENT = 'wordAlignment';
// Bible resources strings
export const DEFAULT_GATEWAY_LANGUAGE = 'en';
export const ORIGINAL_LANGUAGE = 'originalLanguage';
export const TARGET_LANGUAGE = 'targetLanguage';
export const TARGET_BIBLE = 'targetBible';
export const TRANSLATION_WORDS = 'translationWords';
export const TRANSLATION_NOTES = 'translationNotes';
export const TRANSLATION_ACADEMY = 'translationAcademy';
export const TRANSLATION_HELPS = 'translationHelps';
export const LEXICONS = 'lexicons';
export const UGL_LEXICON = 'ugl';
export const UHL_LEXICON = 'uhl';
export const NT_ORIG_LANG = 'el-x-koine';
export const NT_ORIG_LANG_BIBLE = 'ugnt';
export const OT_ORIG_LANG = 'hbo';
export const OT_ORIG_LANG_BIBLE = 'uhb';
// url strings
export const DCS_BASE_URL = 'https://git.door43.org';
// alerts strings
export const ALERT_ALIGNMENTS_RESET_ID = 'alignments_reset';
export const ALERT_SELECTIONS_INVALIDATED_ID = 'selections_invalidated_id';
export const ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG = 'invalid_verse_alignments_and_selections';
export const ALERT_SELECTIONS_INVALIDATED_MSG = 'selections_invalidated';
export const ALERT_ALIGNMENTS_RESET_MSG = 'alignments_reset_wa_tool';
