import React from 'react';
import Container from '../src/Container';
import renderer from 'react-test-renderer';

test('Container renders', () => {
    const component = renderer.create(
        <Container />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});