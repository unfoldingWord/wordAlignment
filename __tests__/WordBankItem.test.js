import React from 'react';
import WordBankItem from '../src/components/WordBankItem';
import renderer from 'react-test-renderer';

test('WordBankItem renders', () => {
    const component = renderer.create(
        <WordBankItem />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});