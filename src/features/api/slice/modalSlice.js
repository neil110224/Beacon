import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userModal: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setUserModal: (state, action) => {
      state.userModal = action.payload;
    },
    resetModal: () => {
      return initialState;
    },
  },
});

export const { setUserModal, resetModal } = modalSlice.actions;

export default modalSlice.reducer;
