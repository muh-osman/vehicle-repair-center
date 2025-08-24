import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useDeleteModelApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (selectedModelId) => {
      const res = await API.delete(`api/car-models/${selectedModelId}`);
      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries("allModels");
      toast.success("Car model deleted successfully");
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
