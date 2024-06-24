import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";

export const fetchCountries = async () => {
  const res = await API.get("api/countries");
  return res.data.countries;
};

export default function useGetCountriesApi() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => fetchCountries(),
  });
}
