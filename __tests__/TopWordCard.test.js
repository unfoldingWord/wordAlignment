import React from 'react';
import TopWordCard from '../src/components/DropBoxItem/TopWordCard';

test('TopWordCard renders', () => {
    const component = (
        <TopWordCard />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});