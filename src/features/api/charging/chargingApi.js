import { todoListApi } from "../../api";

export const chargingApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharging: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.status) queryParams.status = params.status;
        if (params.paginate !== undefined)
          queryParams.paginate = params.paginate;
        if (params.term) queryParams.term = params.term;

        return {
          url: "sync_charging",
          method: "POST",
          body: queryParams,
        };
      },
      providesTags: ["Charging"],
    }),

    getChargingById: builder.query({
      query: (id) => `charging/${id}`,
      providesTags: (result, error, id) => [{ type: "Charging", id }],
    }),

    createCharging: builder.mutation({
      query: (newCharging) => ({
        url: "charging", // ✅ make sure this route exists in Laravel
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
      invalidatesTags: ["Charging"],
    }),

    deleteCharging: builder.mutation({
      query: (id) => ({
        url: `charging/${id}`, // ✅ make sure this route exists in Laravel
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
