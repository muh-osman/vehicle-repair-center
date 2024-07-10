// useGetPriceApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetCarPricesByIdAndYearApi(data) {
  const fetchPrice = async () => {
    try {
      const res = await API.get(
        `api/get-prices-by-model-and-year?car_model_id=${data.modelId}&year_id=${data.yearId}`
      );
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return useQuery({
    enabled: false, // Disable automatic fetching
    queryKey: ["priceBymodelAndYear", data.modelId, data.yearId],
    queryFn: fetchPrice,
  });
}
