// useGetModelsApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetYearsApi(selectedModelId) {
  const fetchYears = async () => {
    try {
      const res = await API.get(`api/year-of-manufacture/${selectedModelId}`);
      return res.data.year;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    enabled: false, // Disable automatic fetching
    queryKey: ["years", selectedModelId],
    queryFn: fetchYears,
  });
}
