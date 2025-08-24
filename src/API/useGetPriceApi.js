// useGetPriceApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetPriceApi(
  selectedModelId,
  selectedYearId,
  selectedServicesId
) {
  const fetchPrice = async () => {
    try {
      const res = await API.get(
        `api/get-price?model=${selectedModelId}&year=${selectedYearId}&service=${selectedServicesId}`
      );
      return res.data;

      console.log(res.data);

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
    queryKey: ["price", selectedModelId, selectedYearId, selectedServicesId],
    queryFn: fetchPrice,
  });
}
