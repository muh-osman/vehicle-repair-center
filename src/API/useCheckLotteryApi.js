import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export default function useCheckLotteryApi(phoneNumber) {
  const fetchCheckLottery = async () => {
    try {
      const res = await API.get(`api/lottery/${phoneNumber}`);
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      toast.error(errorMessage);

      // Return a default value that matches your success response structure
      return {
        data: null,
        message: errorMessage,
      };
    }
  };

  return useQuery({
    queryKey: ["CheckLottery", phoneNumber],
    queryFn: fetchCheckLottery,
  });
}
