import { todoListApi } from "../../api";

export const progressApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemProgress: builder.query({
      query: (systemId) => ({
        url: `progress/${systemId}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // Extract the data object from the response
        return response?.data || {};
      },
      providesTags: ["systems"],
    }),
    updateProgressStatus: builder.mutation({
      query: ({ progressId, status }) => ({
        url: `progress/${progressId}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["systems"],
    }),
    updateProgress: builder.mutation({
      query: ({ progressId, ...data }) => ({
        url: `progress/${progressId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["systems"],
    }),
  }),
});

export const {
  useGetSystemProgressQuery,
  useUpdateProgressStatusMutation,
  useUpdateProgressMutation,
} = progressApi;
