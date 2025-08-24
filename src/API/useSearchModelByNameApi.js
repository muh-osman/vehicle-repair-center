import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useSearchModelByNameApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (searchQuery) => {
      const res = await API.post(`api/car-models/search`, {
        search: searchQuery,
      });

      return res.data.carModels;
    },

    onSuccess: () => {
      //   toast.success("Manufacturer edited.");
      //   Refetch
      //   qc.invalidateQueries("allManufactures");
      //   qc.prefetchQuery({
      //     queryKey: ["allManufactures"],
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
