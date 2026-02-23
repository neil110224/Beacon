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
    }),
  }),
});

export const { useGetSystemProgressQuery } = progressApi;
