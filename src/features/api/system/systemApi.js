import { todoListApi } from "../../api";

export const systemApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemsList: builder.query({
      query: (params = {}) => {
        const {
          status = "active",
          scope = "global",
          team_id = null,
          ...otherParams
        } = params;

        const queryParams = {
          status,
          scope,
        };

        if (team_id) {
          queryParams.team_id = team_id;
        }

        Object.entries(otherParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams[key] = value;
          }
        });

        return {
          url: "systems",
          method: "GET",
          params: queryParams,
        };
      },
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
    updateSystem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `systems/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["systems"],
    }),
    importSystems: builder.mutation({
      query: (formData) => ({
        url: "import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["systems"],
    }),
  }),
});

export const {
  useGetSystemsListQuery,
  useCreateSystemMutation,
  useUpdateSystemMutation,
  useImportSystemsMutation,
} = systemApi;
