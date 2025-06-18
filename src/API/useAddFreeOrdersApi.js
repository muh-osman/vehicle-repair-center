import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useAddFreeOrdersApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/post-free-order", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      qc.prefetchQuery({
        queryKey: ["allFreeOrders"],
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err?.response?.data?.errors?.phone_number[0] ||
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
