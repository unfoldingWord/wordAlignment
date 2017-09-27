import React from 'react';
import DropBoxArea from '../src/components/DropBoxArea';
import renderer from 'react-test-renderer';

test('DropBoxArea renders', () => {
    const component = renderer.create(
        <DropBoxArea />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});