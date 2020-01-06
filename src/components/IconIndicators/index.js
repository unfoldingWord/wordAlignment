import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const IconIndicators = ({
                          isVerseEdited,
                          bookmarkEnabled,
                          translate,
                          comment
                        }) => {

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Glyphicon
        glyph="pencil"
        style={{
          margin: '0px 20px',
          color: isVerseEdited ? 'var(--highlight-color)' : 'var(--reverse-color)'
        }}
        title={isVerseEdited ? translate('icons.verse_edits_found') : translate('icons.no_verse_edits_found')}
      />
      <Glyphicon
        glyph="comment"
        style={{
          margin: '0px 20px',
          color: comment ? 'var(--highlight-color)' : 'var(--reverse-color)'
        }}
        title={comment ? translate('icons.comments_found') : translate('icons.no_comments_found')}
      />
      <Glyphicon
        glyph="bookmark"
        style={{
          margin: '0px 20px',
          color: bookmarkEnabled ? 'var(--highlight-color)' : 'var(--reverse-color)'
        }}
        title={bookmarkEnabled ? translate('icons.bookmarked') : translate('icons.not_bookmarked')}
      />
    </div>
  );
};

IconIndicators.propTypes = {
  translate: PropTypes.func.isRequired,
  isVerseEdited: PropTypes.bool.isRequired,
  comment: PropTypes.string,
  bookmarkEnabled: PropTypes.bool,
};

export default IconIndicators;
