import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";

export const fetchLottery = async () => {
  const res = await API.get("api/lottery");
  return res.data;
};
export default function useGetAllLotteryApi() {
  return useQuery({
    queryKey: ["Lottery"],
    queryFn: () => fetchLottery(),
  });
}
