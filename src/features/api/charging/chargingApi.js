import { todoListApi } from "../../api";

export const chargingApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharging: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.status) queryParams.status = params.status;
        if (params.paginate !== undefined)
          queryParams.paginate = params.paginate;
        if (params.pagination) queryParams.pagination = params.pagination;
        if (params.term) queryParams.term = params.term;

        const config = { url: "charging" };
        if (Object.keys(queryParams).length > 0) {
          config.params = queryParams;
        }
        return config;
      },
      providesTags: ["Charging"],
    }),

    getChargingById: builder.query({
      query: (id) => `charging/${id}`,
      providesTags: (result, error, id) => [{ type: "Charging", id }],
    }),

    createCharging: builder.mutation({
      query: (newCharging) => ({
        url: "charging",
        method: "POST",
        body: newCharging,
      }),
      invalidatesTags: ["Charging"],
    }),

    updateCharging: builder.mutation({
      query: ({ id, data }) => ({
        url: `charging/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Charging", id },
        "Charging",
      ],
    }),

    deleteCharging: builder.mutation({
      query: (id) => ({
        url: `charging/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Charging"],
    }),
  }),
});

export const {
  useGetChargingQuery,
  useGetChargingByIdQuery,
  useCreateChargingMutation,
  useUpdateChargingMutation,
  useDeleteChargingMutation,
} = chargingApi;
