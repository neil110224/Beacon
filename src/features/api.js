import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const todoListApi = createApi({
  reducerPath: "todoListApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.14.61:8000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  tagTypes: ["Users", "Roles"], // Add 'Roles' here
  endpoints: () => ({}),
});
