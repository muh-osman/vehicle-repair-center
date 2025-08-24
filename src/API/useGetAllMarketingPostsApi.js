// useGetModelsApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const fetchMarketingPosts = async () => {
  try {
    const response = await API.get(`api/get-all/marketing-posts`);
    return response.data;
  } catch (err) {
    console.error("Error fetching marketing posts:", err);

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch marketing posts";

    // Only show toast on client-side
    if (typeof window !== "undefined") {
      toast.error(errorMessage);
    }

    // Rethrow the error so React Query can handle it properly
    throw new Error(errorMessage);
  }
};

export default function useGetAllMarketingPostsApi() {
  return useQuery({
    queryKey: ["MarketingPosts"],
    queryFn: fetchMarketingPosts,
  });
}
