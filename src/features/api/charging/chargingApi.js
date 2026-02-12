import { todoListApi } from "../../api";

export const chargingApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharging: builder.query({
      query: (params = {}) => ({
        url: "charging",
        params: {
          status: params.status || "active",
          paginate: params.paginate || "none",
          pagination: params.pagination || "none",
          term: params.term || "",
        },
      }),
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
