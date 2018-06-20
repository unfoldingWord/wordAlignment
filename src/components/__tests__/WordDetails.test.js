import React from 'react';
import WordDetails from '../WordDetails';
import renderer from 'react-test-renderer';

describe('WordDetails', () => {
  it('renders', () => {
    const wrapper = renderer.create(
      <WordDetails
        lexiconData={{}}
         wordObject={{
           lemma: 'lemma',
           morph: 'morph',
           strong: 'strong'
         }}
         translate={k=>k}/>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
