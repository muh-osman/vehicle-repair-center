import { useQuery } from "@tanstack/react-query";
// Axios
import axios from "axios";

export const fetchPriceServices = async ({ year, modelId }) => {
  const res = await axios.get(`https://cashif-001-site3.anytempurl.com/api/ServicePrices/ByYearAndMark?year=${year}&markId=${modelId}`);
  return res.data;
};

export default function useSearchModelByNameApi(year, modelId) {
  return useQuery({
    queryKey: ["allSearchModels", year, modelId],
    queryFn: () => fetchPriceServices({ year, modelId }),
    enabled: !!year && !!modelId, // prevents request if values are missing
  });
}
