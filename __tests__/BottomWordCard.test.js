import React from 'react';
import BottomWordCard from '../src/components/DropBoxItem/BottomWordCard';
import renderer from 'react-test-renderer';

test('BottomWordCard renders', () => {
    const component = renderer.create(
        <BottomWordCard />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});