import React from 'react';
import DropBoxItem from '../src/components/DropBoxItem';
import renderer from 'react-test-renderer';

test('DropBoxItem renders', () => {
    const component = renderer.create(
        <DropBoxItem />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});