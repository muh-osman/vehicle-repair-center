// useGetModelsApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useGetAllModelsInDatabaseApi() {
  const fetchAllModel = async () => {
    try {
      const res = await API.get(`api/car-models`);
      return res.data.carModels;
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["allModels"],
    queryFn: fetchAllModel,
  });
}
