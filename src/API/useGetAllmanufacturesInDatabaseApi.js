import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetAllManufacturesInDatabaseApi() {
  const fetchAllManufactures = async () => {
    try {
      const res = await API.get(`api/manufacturers`);
      return res.data.manufacturers;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["allManufactures"],
    queryFn: fetchAllManufactures,
  });
}
