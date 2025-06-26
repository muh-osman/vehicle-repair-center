import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetUsersAnalyticsApi() {
  const fetchUsersAnalytics = async () => {
    try {
      const res = await API.get("api/get-all-users-analytics");
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["usersAnalytics"],
    queryFn: fetchUsersAnalytics,
  });
}
