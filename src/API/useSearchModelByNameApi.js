import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";

export const fetchModels = async () => {
  const res = await API.get(`api/all-car-models`);
  return res.data;
};

export default function useSearchModelByNameApi() {
  return useQuery({
    queryKey: ["allSearchModels"],
    queryFn: fetchModels,
  });
}
