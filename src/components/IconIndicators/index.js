import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import ThreeDotMenu from '../ThreeDotMenu';

const IconIndicators = ({
  translate,
  toolsSettings,
  setToolSettings,
  commentStateSet,
  bookmarkStateSet,
  commentIconEnable,
  verseEditStateSet,
  commentClickAction,
  bookmarkIconEnable,
  verseEditIconEnable,
  bookmarkClickAction,
  verseEditClickAction,
}) => (
  <div style={{
    display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline',
  }}>
    {verseEditIconEnable ? (
      <Glyphicon
        glyph="pencil"
        style={{
          margin: '0px 20px',
          color: verseEditStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)',
        }}
        title={verseEditStateSet ? translate('icons.verse_edits_found') : translate('icons.no_verse_edits_found')}
        onClick={verseEditClickAction}
      />
    ) : '' }
    {commentIconEnable ? (
      <Glyphicon
        glyph="comment"
        style={{
          margin: '0px 20px',
          color: commentStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)',
        }}
        title={commentStateSet ? translate('icons.comments_found') : translate('icons.no_comments_found')}
        onClick={commentClickAction}
      />
    ) : '' }
    {bookmarkIconEnable ? (
      <Glyphicon
        glyph="bookmark"
        style={{
          margin: '0px 20px',
          color: bookmarkStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)',
        }}
        title={bookmarkStateSet ? translate('icons.bookmarked') : translate('icons.not_bookmarked')}
        onClick={bookmarkClickAction}
      />
    ) : '' }
    <ThreeDotMenu namespace='AlignmentGrid' toolsSettings={toolsSettings} setToolSettings={setToolSettings}/>
  </div>
);

IconIndicators.propTypes = {
  translate: PropTypes.func.isRequired,
  toolsSettings: PropTypes.object.isRequired,
  setToolSettings: PropTypes.func.isRequired,
  commentStateSet: PropTypes.bool.isRequired,
  bookmarkStateSet: PropTypes.bool.isRequired,
  commentIconEnable: PropTypes.bool.isRequired,
  verseEditStateSet: PropTypes.bool.isRequired,
  bookmarkIconEnable: PropTypes.bool.isRequired,
  commentClickAction: PropTypes.func.isRequired,
  verseEditIconEnable: PropTypes.bool.isRequired,
  bookmarkClickAction: PropTypes.func.isRequired,
  verseEditClickAction: PropTypes.func.isRequired,
};

IconIndicators.defaultProps = {
  verseEditStateSet: false,
  verseEditIconEnable: false,
  commentStateSet: false,
  commentIconEnable: false,
  bookmarkStateSet: false,
  bookmarkIconEnable: false,
  verseEditClickAction: () => false,
  bookmarkClickAction: () => false,
  commentClickAction: () => false,
};

export default IconIndicators;
