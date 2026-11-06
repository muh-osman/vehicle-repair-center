import { useMutation, useQueryClient } from "@tanstack/react-query";
// Toastify
import { toast } from "react-toastify";
// Axios
import axios from "axios";

export const useAddSippingCarOrderApi = () => {
  //   const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await axios.post("https://cashif.cc/payment-system/back-end/public/api/store-shipping-car-order", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      toast.success("تم الطلب");
      // qc.invalidateQueries(["Appointment", clientId]); // This will refetch the appointments
    },

    onError: (err) => {
      console.error(err);
    },
  });
};
