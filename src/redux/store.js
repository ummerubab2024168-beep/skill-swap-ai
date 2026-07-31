// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice'; 

export const store = configureStore({
  reducer: {
    auth: userReducer, // Redux store mein ab 'auth' naam ka slice active ho gaya
  },
});