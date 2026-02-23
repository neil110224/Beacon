import { todoListApi } from "../../api";

export const categoryApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategoriesList: builder.query({
      query: (params = {}) => {
        const {
          status = "active",
          pagination = "none",
          ...otherParams
        } = params;

        const queryParams = new URLSearchParams();

        if (status) {
          queryParams.append("status", status);
        }
        if (pagination) {
          queryParams.append("pagination", pagination);
        }

        Object.entries(otherParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });

        const queryString = queryParams.toString();
        const url = queryString ? `category?${queryString}` : "category";

        return {
          url: url,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
      },
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["categories"],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["categories"],
    }),
  }),
});

export const {
  useGetCategoriesListQuery,
  useDeleteCategoryMutation,
  useCreateCategoryMutation,
} = categoryApi;
