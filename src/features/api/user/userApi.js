import { todoListApi } from "../../api";

const userApi = todoListApi
  .enhanceEndpoints({
    addTagTypes: ["users"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      login: build.mutation({
        query: (credentials) => ({
          url: "login",
          method: "POST",
          body: credentials,
        }),
      }),

      // getUsers: build.query({
      //   query: (params = {}) => {
      //     const {
      //       status = "active",
      //       paginate,
      //       pagination = "none",
      //       term,
      //       ...otherParams
      //     } = params;

      //     const queryParams = new URLSearchParams();

      //     if (status) {
      //       queryParams.append("status", status);
      //     }
      //     if (paginate !== undefined) {
      //       queryParams.append("paginate", paginate.toString());
      //     }
      //     if (pagination) {
      //       queryParams.append("pagination", pagination);
      //     }
      //     if (term && term.trim() !== "") {
      //       queryParams.append("term", term.trim());
      //     }

      //     Object.entries(otherParams).forEach(([key, value]) => {
      //       if (value !== undefined && value !== null && value !== "") {
      //         queryParams.append(key, value.toString());
      //       }
      //     });

      //     const queryString = queryParams.toString();
      //     const url = queryString ? `user?${queryString}` : "user";

      //     return {
      //       url,
      //       method: "GET",
      //     };
      //   },
      //   providesTags: ["users"],
      // }),

      getUsers: build.query({
        query: (params = {}) => {
          const queryParams = {};
          if (params.status) queryParams.status = params.status;
          if (params.search) queryParams.search = params.search;
          if (params.team_id) queryParams.team_id = params.team_id;

          const config = { url: "user", method: "GET" };
          if (Object.keys(queryParams).length > 0) {
            config.params = queryParams;
          }
          return config;
        },
        providesTags: ["users"],
      }),

      createUser: build.mutation({
        query: (data) => ({
          url: "register",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["users"],
      }),

      updateUser: build.mutation({
        query: ({ id, data }) => ({
          url: `user/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "users", id },
          "users",
        ],
      }),

      updateUserProfilePicture: build.mutation({
        query: ({ id, data }) => ({
          url: `user/${id}/profile-picture`,
          method: "GET",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "users", id },
          "users",
        ],
      }),

      deleteUser: build.mutation({
        query: (id) => ({
          url: `user/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "users", id },
          "users",
        ],
      }),
    }),
  });

export const {
  useLoginMutation,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserProfilePictureMutation,
} = userApi;

export default userApi;
