import { configureStore } from "@reduxjs/toolkit";
import { todoListApi } from "../features/api";

import authReducer from "../features/api/slice/authSlice";
import formReducer from "../features/api/slice/fromSlice";
import modalReducer from "../features/api/slice/modalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    form: formReducer,
    modal: modalReducer,

    [todoListApi.reducerPath]: todoListApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(todoListApi.middleware),
});
