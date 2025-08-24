import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useAddFalakVideoApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/post-falak-video", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      qc.prefetchQuery({
        queryKey: ["falakVideos"],
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err?.response?.data?.errors?.report_number[0] ||
        err?.response?.data?.errors?.video_file[0] ||
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
