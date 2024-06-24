import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetCountriesApi() {

  const fetchCountries = async () => {
    try {
      const res = await API.get("api/countries");
      return res.data.countries;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });
}
