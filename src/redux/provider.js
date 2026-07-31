// src/redux/provider.js
'use client'; // Kyunki Redux client-side par chalta hai

import { Provider } from 'react-redux';
import { store } from './store';

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}