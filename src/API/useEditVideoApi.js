import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useEditVideoApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      console.log(data)
      const res = await API.post(`api/edit-video`, data);
      return res.data;
    },

    onSuccess: () => {
    //   toast.success("Added successfully.");

      qc.prefetchQuery({
        queryKey: ["videos"],
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
