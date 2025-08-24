// useGetManufacturesApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetManufacturesApi(selectedCountryId) {

  const fetchManufactures = async () => {
    try {
      const res = await API.get(
        `api/manufacturers/by-country/${selectedCountryId}`
      );
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
    enabled: false, // Disable automatic fetching
    queryKey: ["manufactures", selectedCountryId],
    queryFn: fetchManufactures,
  });
}
