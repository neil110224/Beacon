import { todoListApi } from "../../api";

export const systemApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemsList: builder.query({
      query: (params = {}) => {
        // Dynamic parameters: status, scope, team_id
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

        // Only add team_id if provided (for per_team scope)
        if (team_id) {
          queryParams.team_id = team_id;
        }

        // Add any other params
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
  }),
});

export const {
  useGetSystemsListQuery,
  useCreateSystemMutation,
  useUpdateSystemMutation,
} = systemApi;
