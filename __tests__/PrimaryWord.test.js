import React from 'react';
import PrimaryWord from '../src/components/PrimaryWord';

test('TopWordCard renders', () => {
    const component = (
        <PrimaryWord />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});
