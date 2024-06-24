// useGetManufacturesApi.js
import { useQuery } from "@tanstack/react-query";
// API base
import API from "./Api";

export const fetchManufactures = async (selectedCountryId) => {
  const res = await API.get(
    `api/manufacturers/by-country/${selectedCountryId}`
  );
  return res.data.manufacturers;
};

export default function useGetManufacturesApi(selectedCountryId) {
  return useQuery({
    enabled: false, // Disable automatic fetching
    queryKey: ["manufactures", selectedCountryId],
    queryFn: () => fetchManufactures(selectedCountryId),
  });
}
