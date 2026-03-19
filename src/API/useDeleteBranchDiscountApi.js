import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useDeleteBranchDiscountApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`api/delete-branch-discount/${id}`);
      return res.data;
    },

    onSuccess: () => {
      qc.prefetchQuery({
        queryKey: ["AllBranchDiscount"],
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
