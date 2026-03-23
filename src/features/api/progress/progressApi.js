import { todoListApi } from "../../api";

export const progressApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemProgress: builder.query({
      query: (systemId) => ({
        url: `progress/${systemId}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data || {},
      providesTags: ["systems"],
    }),

    // ✅ Bulk update — handles single or multiple ids, any status
    updateProgress: builder.mutation({
      query: ({ ids, status, end_date, remarks }) => ({
        url: `progress`,
        method: "PUT",
        body: {
          ids: Array.isArray(ids) ? ids : [ids], // always send array
          status,
          ...(end_date && { end_date }),
          ...(remarks && { remarks }),
        },
      }),
      invalidatesTags: ["systems"],
    }),

    createProgress: builder.mutation({
      query: (data) => ({
        url: `progress`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["systems"],
    }),
  }),
});

export const {
  useGetSystemProgressQuery,
  useUpdateProgressMutation,
  useCreateProgressMutation,
} = progressApi;
