import React from 'react';
import Container from '../src/Container';

test('Container renders', () => {
    const component = (
        <Container />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});