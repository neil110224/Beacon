// import { todoListApi } from "../../api";

// export const chargingApi = todoListApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getCharging: builder.query({
//       query: (params = {}) => {
//         const searchParams = new URLSearchParams();
//         if (params.status) searchParams.append("status", params.status);
//         searchParams.append("pagination", "none");
//         if (params.term) searchParams.append("term", params.term);
//         return {
//           url: `charging?${searchParams.toString()}`,
//           method: "GET",
//         };
//       },
//       providesTags: ["Charging"],
//     }),

//     getChargingById: builder.query({
//       query: (id) => `charging/${id}`,
//       providesTags: (result, error, id) => [{ type: "Charging", id }],
//     }),

//     // getSyncCharging: builder.query({
//     //   query: () => ({
//     //     url: "sync_charging",
//     //     method: "GET",
//     //   }),
//     //   invalidatesTags: ["Charging"],
//     // }),
//     getSyncCharging: builder.query({
//       query: (params) => ({
//         url: "sync_charging",
//         params,
//       }),
//       method: "GET",
//       providesTags: ["Users"],
//     }),
//   }),
// });

// export const {
//   useGetChargingQuery,
//   useLazyGetChargingQuery,
//   useGetChargingByIdQuery,
//   useCreateChargingMutation,
//   useUpdateChargingMutation,
//   useDeleteChargingMutation,
//   useGetSyncChargingQuery,
//   useLazySyncChargingQuery,
// } = chargingApi;
import { todoListApi } from "../../api";

export const chargingApi = todoListApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharging: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append("status", params.status);
        searchParams.append("pagination", "none");
        if (params.term) searchParams.append("term", params.term);
        return {
          url: `charging?${searchParams.toString()}`,
          method: "GET",
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
      invalidatesTags: ["Charging"],
    }),

    deleteCharging: builder.mutation({
      query: (id) => ({
        url: `charging/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Charging"],
    }),

    syncCharging: builder.query({
      query: () => ({
        url: "sync_charging",
        method: "GET",
      }),
      providesTags: ["Charging"],
    }),
  }),
});

export const {
  useGetChargingQuery,
  useLazyGetChargingQuery,
  useGetChargingByIdQuery,
  useCreateChargingMutation,
  useUpdateChargingMutation,
  useDeleteChargingMutation,
  useSyncChargingQuery,
  useLazySyncChargingQuery, // ✅ add this
} = chargingApi;
