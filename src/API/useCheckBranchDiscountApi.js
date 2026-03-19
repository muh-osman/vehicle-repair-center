import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useCheckBranchDiscountApi(branch) {
  const fetchBranchDiscount = async () => {
    try {
      const res = await API.get(`api/show-branch-discount/${branch}`);
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      toast.error(errorMessage);

      // Return a default value that matches your success response structure
      return {
        data: null,
        message: errorMessage,
      };
    }
  };

  return useQuery({
    queryKey: ["CheckFreeOrder", branch],
    queryFn: fetchBranchDiscount,

    // Disable caching
    cacheTime: 0, // garbage collect immediately after unused
    staleTime: 0, // always treat data as stale

    // Optional: refetch every time component mounts
    refetchOnMount: true,
  });
}
