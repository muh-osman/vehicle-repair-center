import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";

export const fetchTableData = async () => {
  const res = await API.get("api/prices");
  return res.data;
};

export default function useFetchAllTableDataApi() {
  return useQuery({
    queryKey: ["tableData"],
    queryFn: () => fetchTableData(),
  });
}