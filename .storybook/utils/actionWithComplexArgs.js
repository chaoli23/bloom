import { action } from '@storybook/react';

export default name => (...args) => {
  /* eslint-disable no-console */
  console.log(`"${name}"`, args);
  /* eslint-enable no-console */
  action(name)('Complex object: See console for args');
};