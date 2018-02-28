import React from 'react';
import Container from '../src/Container';

test('Container renders', () => {
  const component = (
    <Container actions={{}}
               settingsReducer={{}}
               contextIdReducer={{}}
               currentToolViews={{}}
               resourcesReducer={{}}/>
  );
  expect(component).toMatchSnapshot();

  // TODO: exercise UI
});
