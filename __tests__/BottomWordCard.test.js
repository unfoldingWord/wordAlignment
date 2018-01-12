import React from 'react';
import BottomWordCard from '../src/components/DropBoxItem/BottomWordCard';

test('BottomWordCard renders', () => {
    const component = (
        <BottomWordCard />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});