import { todoListApi } from "../../api";

export const systemApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemsList: builder.query({
      query: () => ({
        url: "systems",
        method: "GET",
        params: {
          status: "active", // or "all", 1, true — check your backend
        },
      }),
      transformResponse: (response) => {
        return Array.isArray(response) ? response : response?.data || [];
      },
      providesTags: ["systems"],
    }),
    createSystem: builder.mutation({
      query: (data) => ({
        url: "systems",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["systems"],
    }),
  }),
});

export const { useGetSystemsListQuery, useCreateSystemMutation } = systemApi;
