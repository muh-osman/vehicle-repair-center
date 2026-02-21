import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useEditVideoApi = (setUploadProgress) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      // console.log(data);
      const res = await API.post(`api/new-edit-video/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },

        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent); // 👈 update state
        },
      });
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
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
