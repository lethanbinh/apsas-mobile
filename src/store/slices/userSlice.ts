import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface userSlice {
  userData: object | null;
}

const initialState: userSlice = {
  userData: null,
};

export const userSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<Object>) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
