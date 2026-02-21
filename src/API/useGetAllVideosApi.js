import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetAllVideosApi() {
  const fetchAllVideos = async () => {
    try {
      const res = await API.get("api/new-get-all-videos");
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["videos"],
    queryFn: fetchAllVideos,
  });
}
