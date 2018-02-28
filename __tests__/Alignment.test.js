import React from 'react';
import Alignment from '../src/components/Alignment';

test('snapshot', () => {
    const component = (
        <Alignment />
    );
    expect(component).toMatchSnapshot();

    // TODO: exercise UI
});
