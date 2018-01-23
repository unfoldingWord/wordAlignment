import React from 'react';
import DropBoxItem from '../src/components/DropBoxItem';

test('DropBoxItem renders', () => {
    const component = (
        <DropBoxItem />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});