import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";
// Toastify
import { toast } from "react-toastify";
//
import axios from "axios";

export default function useGetAllShippingPaymensApi() {
  const fetchAllShippingPaymens = async () => {
    try {
      const res = await axios.get("https://cashif.cc/payment-system/back-end/public/api/shipping-payments");
      return res.data;
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    }
  };

  return useQuery({
    queryKey: ["allShippingPaymens"],
    queryFn: fetchAllShippingPaymens,
  });
}
