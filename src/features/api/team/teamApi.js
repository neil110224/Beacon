import { todoListApi } from "../../api";

export const teamApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.status) queryParams.status = params.status;
        if (params.paginate !== undefined)
          queryParams.paginate = params.paginate;
        if (params.pagination) queryParams.pagination = params.pagination;
        if (params.term) queryParams.term = params.term;

        const config = { url: "team" };
        if (Object.keys(queryParams).length > 0) {
          config.params = queryParams;
        }
        return config;
      },
      providesTags: ["Teams"],
    }),

    getTeamById: builder.query({
      query: (id) => `team/${id}`,
      providesTags: (result, error, id) => [{ type: "Teams", id }],
    }),

    createTeam: builder.mutation({
      query: (newTeam) => ({
        url: "team",
        method: "POST",
        body: newTeam,
      }),
      invalidatesTags: ["Teams"],
    }),

    updateTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `team/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        "Teams",
      ],
    }),

    // ── PATCH: used for partial updates like add/remove systems ──
    patchTeam: builder.mutation({
      query: ({ id, body }) => ({
        url: `team/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        "Teams",
      ],
    }),

    restoreTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `team/${id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        "Teams",
      ],
    }),

    addTeamMember: builder.mutation({
      query: ({ teamId, userId }) => ({
        url: `team/${teamId}/members`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        "Teams",
        "users",
      ],
    }),

    removeTeamMember: builder.mutation({
      query: ({ teamId, userId }) => ({
        url: `team/${teamId}/remove-member`,
        method: "DELETE",
        body: { user_id: userId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        "Teams",
        "users",
      ],
    }),

    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `team/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams", "users"],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  usePatchTeamMutation, // ← new
  useRestoreTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useDeleteTeamMutation,
} = teamApi;
