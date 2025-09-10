import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetOneRefundClientByRandApi(rand) {
  const fetchOneRefundClientByRand = async () => {
    try {
      const res = await API.get(`api/get-one-refund-client-by-rand/${rand}`);
      return res.data.client;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    // enabled: false, // Disable automatic fetching
    queryKey: ["oneRefundClientByRand", rand],
    queryFn: fetchOneRefundClientByRand,

    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
