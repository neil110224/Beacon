import { todoListApi } from "../../api";

export const roleApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.status) queryParams.status = params.status;
        if (params.paginate !== undefined)
          queryParams.paginate = params.paginate;
        if (params.pagination) queryParams.pagination = params.pagination;
        if (params.term) queryParams.term = params.term;

        const config = { url: "role" };
        if (Object.keys(queryParams).length > 0) {
          config.params = queryParams;
        }
        return config;
      },
      transformResponse: (response) => {
        return Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
      },
      providesTags: (result, error, arg) => [
        { type: "Roles", id: arg?.status || "LIST" },
      ],
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
      invalidatesTags: [{ type: "Roles", id: "active" }],
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
      invalidatesTags: [
        { type: "Roles", id: "active" },
        { type: "Roles", id: "inactive" },
      ],
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
