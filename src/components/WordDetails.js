import React from 'react';
// helpers
import * as lexiconHelpers from '../utils/lexicon';
import PropTypes from 'prop-types';

class WordDetails extends React.Component {

  render() {
    let {lemma, morph, strong} = this.props.wordObject;
    const {translate, lexiconData} = this.props;
    let lexicon;
    if (strong) {
      const entryId = lexiconHelpers.lexiconEntryIdFromStrongs(strong);
      const lexiconId = lexiconHelpers.lexiconIdFromStrongs(strong);
      if (lexiconData[lexiconId] && lexiconData[lexiconId][entryId]) {
        lexicon = lexiconData[lexiconId][entryId].long;
      }
    }
    return (
      <div style={{margin: '-10px 10px -20px', maxWidth: '400px'}}>
        <span><strong>{translate("lemma")}</strong> {lemma}</span><br/>
        <span><strong>{translate("morphology")}</strong> {morph}</span><br/>
        <span><strong>{translate("strongs")}</strong> {strong}</span><br/>
        <span><strong>{translate("lexicon")}</strong> {lexicon}</span><br/>
      </div>
    );
  }
}

WordDetails.propTypes = {
  translate: PropTypes.func.isRequired,
  wordObject: PropTypes.shape({
    lemma: PropTypes.string.isRequired,
    morph: PropTypes.string.isRequired,
    strong: PropTypes.string.isRequired
  }).isRequired,
  lexiconData: PropTypes.object.isRequired
};

export default WordDetails;
