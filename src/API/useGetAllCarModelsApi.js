import { useQuery } from "@tanstack/react-query";
// Axios
import axios from "axios";

export const AllCarModels = async () => {
  const res = await axios.get(`https://cashif-001-site3.anytempurl.com/api/CarMark`);
  return res.data;
};

export default function useGetAllCarModelsApi() {
  return useQuery({
    queryKey: ["AllCarModels"],
    queryFn: AllCarModels,
    // enabled: !!token, // Only run the query if the token exists
    // how long data is considered fresh
    staleTime: 1000 * 60 * 5, // 5 minutes

    // how long unused cache stays in memory
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
