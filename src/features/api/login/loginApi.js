import { todoListApi } from "../../api";

const loginApi = todoListApi
  .enhanceEndpoints({
    addTagTypes: ["users"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      userLogin: build.mutation({
        query: (credentials) => ({
          url: "login",
          method: "POST",
          body: credentials,
        }),
      }),
    }),
  });

export const { useUserLoginMutation } = loginApi;

export default loginApi;
