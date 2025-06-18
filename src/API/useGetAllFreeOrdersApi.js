import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetAllFreeOrdersApi() {
  const fetchAllFreeOrders = async () => {
    try {
      const res = await API.get("api/get-all-free-Orders");
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
    queryKey: ["allFreeOrders"],
    queryFn: fetchAllFreeOrders,
  });
}
