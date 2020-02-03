import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const IconIndicators = ({
  translate,
  verseEditStateSet,
  verseEditIconEnable,
  commentStateSet,
  commentIconEnable,
  bookmarkStateSet,
  bookmarkIconEnable,
  verseEditClickAction,
  commentClickAction,
  bookmarkClickAction,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      {verseEditIconEnable ? (
        <Glyphicon
          glyph="pencil"
          style={{
            margin: '0px 20px',
            color: verseEditStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)'
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
            color: commentStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)'
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
            color: bookmarkStateSet ? 'var(--highlight-color)' : 'var(--reverse-color)'
          }}
          title={bookmarkStateSet ? translate('icons.bookmarked') : translate('icons.not_bookmarked')}
          onClick={bookmarkClickAction}
        />
      ) : '' }
    </div>
  );
};

IconIndicators.propTypes = {
  translate: PropTypes.func.isRequired,
  verseEditStateSet: PropTypes.bool.isRequired,
  verseEditIconEnable: PropTypes.bool.isRequired,
  commentStateSet: PropTypes.bool.isRequired,
  commentIconEnable: PropTypes.bool.isRequired,
  bookmarkStateSet: PropTypes.bool.isRequired,
  bookmarkIconEnable: PropTypes.bool.isRequired,
  verseEditClickAction: PropTypes.func.isRequired,
  bookmarkClickAction: PropTypes.func.isRequired,
  commentClickAction: PropTypes.func.isRequired,
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
