import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string | string[];
  [key: string]: any;
}

interface UserState {
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  profile: null,
  token: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserAndToken: (
      state,
      action: PayloadAction<{ profile: UserProfile; token: string }>,
    ) => {
      state.profile = action.payload.profile;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearUser: state => {
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserAndToken, clearUser } = userSlice.actions;
export default userSlice.reducer;
