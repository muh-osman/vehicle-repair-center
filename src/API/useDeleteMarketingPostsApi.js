import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useDeleteMarketingPostsApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (marketingPostId) => {
      const res = await API.delete(`api/delete/marketing-posts/${marketingPostId}`);
      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries("MarketingPosts");
      toast.success("Post deleted successfully");
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
