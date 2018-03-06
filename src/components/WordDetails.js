import React from 'react';
// helpers
import * as lexiconHelpers from '../utils/lexicon';
import PropTypes from 'prop-types';

class WordDetails extends React.Component {

  render() {
    let {lemma, morph, strong} = this.props.wordObject;
    let lexicon;
    if (strong) {
      const {lexicons} = this.props;
      const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strong);
      const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strong);
      if (lexicons[lexiconId] && lexicons[lexiconId][entryId]) {
        lexicon = lexicons[lexiconId][entryId].long;
      }
    }
    return (
      <div style={{margin: '-10px 10px -20px', maxWidth: '400px'}}>
        <span><strong>Lemma:</strong> {lemma}</span><br/>
        <span><strong>Morphology:</strong> {morph}</span><br/>
        <span><strong>Strongs:</strong> {strong}</span><br/>
        <span><strong>Lexicon:</strong> {lexicon}</span><br/>
      </div>
    );
  }
}

WordDetails.propTypes = {
  wordObject: PropTypes.shape({
    lemma: PropTypes.string.isRequired,
    morph: PropTypes.string.isRequired,
    strong: PropTypes.string.isRequired
  }),
  lexicons: PropTypes.object.isRequired
};

export default WordDetails;
