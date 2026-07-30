import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;