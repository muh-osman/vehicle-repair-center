import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useUpdateRefundClientApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      let id = data.get("id");

      const res = await API.post(`api/update-refund-client-data/${id}`, data);
      return res.data;
    },

    onSuccess: (responseData) => {
      //   qc.prefetchQuery({
      //     queryKey: [""],
      //   });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
