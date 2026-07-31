// src/redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null, // Token yahan save hoga
    isAuthenticated: false,
  },
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user; // User data
      state.token = action.payload.token; // Token save hoga
      state.isAuthenticated = true;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null; // Logout par token khatam
      state.isAuthenticated = false;
    },
  },
});

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;