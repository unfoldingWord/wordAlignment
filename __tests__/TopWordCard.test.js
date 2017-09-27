import React from 'react';
import TopWordCard from '../src/components/DropBoxItem/TopWordCard';
import renderer from 'react-test-renderer';

test('TopWordCard renders', () => {
    const component = renderer.create(
        <TopWordCard />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // TODO: exercise UI
});