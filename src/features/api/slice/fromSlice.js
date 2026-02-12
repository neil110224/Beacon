import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  approvalForm: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setApprovalForm: (state, action) => {
      console.log("Redux Approval Form triggered:", action.payload);
      state.approvalForm = action.payload;
    },
    resetApprovalForm: () => {
      return initialState;
    },
  },
});

export const { setApprovalForm, resetApprovalForm } = formSlice.actions;

export default formSlice.reducer;
