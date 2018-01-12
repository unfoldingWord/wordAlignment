import React from 'react';
import WordBankItem from '../src/components/WordBankItem';

test('WordBankItem renders', () => {
    const component = (
        <WordBankItem />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});