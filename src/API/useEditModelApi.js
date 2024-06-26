import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useEditModelApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.put(`api/car-models/${data.maodelId}`, data);
      return res.data;
    },

    onSuccess: () => {
      toast.success("Model edited.");

      //   Refetch
      qc.invalidateQueries("allModels");

      //   qc.prefetchQuery({
      //     queryKey: ["allModels"],
      //     queryFn: () => fetchPosts(),
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
