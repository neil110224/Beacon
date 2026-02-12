import { todoListApi } from "../../api";

export const roleApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: (params = {}) => ({
        url: "role",
        params: {
          status: params.status || "active",
          paginate: params.paginate || "none",
          pagination: params.pagination || "none",
          term: params.term || "",
        },
      }),
      providesTags: ["Roles"],
    }),

    getRoleById: builder.query({
      query: (id) => `role/${id}`,
      providesTags: (result, error, id) => [{ type: "Roles", id }],
    }),

    createRole: builder.mutation({
      query: (newRole) => ({
        url: "role",
        method: "POST",
        body: newRole,
      }),
      invalidatesTags: ["Roles"],
    }),

    updateRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `role/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Roles", id },
        "Roles",
      ],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `role/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
