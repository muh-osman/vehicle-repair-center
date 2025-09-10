import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useDeleteRefundClientApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`api/delete-refund-client/${id}`);
      return res.data;
    },

    onSuccess: () => {
      qc.prefetchQuery({
        queryKey: ["allRefoundClients"],
      });
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
