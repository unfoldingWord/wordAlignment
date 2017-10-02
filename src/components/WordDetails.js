import React from 'react';
// helpers
import * as lexiconHelpers from '../helpers/lexiconHelpers';

class WordDetails extends React.Component {

  render() {
    let { word, lemma, morph, strongs } = this.props.word;
    let lexicon;
    if (strongs) {
      const { lexicons } = this.props.resourcesReducer;
      const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strongs);
      const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strongs);
      if (lexicons[lexiconId] && lexicons[lexiconId][entryId]) {
        lexicon = lexicons[lexiconId][entryId].long;
      }
    }
    return (
      <div style={{ margin: '-10px 10px -20px', maxWidth: '400px' }}>
        <span><strong>Lemma:</strong> {lemma}</span><br />
        <span><strong>Morphology:</strong> {morph}</span><br />
        <span><strong>Strongs:</strong> {strongs}</span><br />
        <span><strong>Lexicon:</strong> {lexicon}</span><br />
      </div>
    );
  }
}

export default WordDetails;
