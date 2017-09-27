import React from 'react';
import WordBankArea from '../src/components/WordBankArea';
import renderer from 'react-test-renderer';

test('WordBankItem renders', () => {
    const component = renderer.create(
        <WordBankArea />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});