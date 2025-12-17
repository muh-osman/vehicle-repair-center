import { useMutation, useQueryClient } from "@tanstack/react-query";
// Toastify
import { toast } from "react-toastify";
//
import axios from "axios";

const markAsShipped = async (id) => {
  const response = await axios.put(`https://cashif.cc/payment-system/back-end/public/api/shipping-payments/mark-as-shipped/${id}`);
  return response.data;
};

export default function useEditIsShippedApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsShipped,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["allShippingPaymens"] });
      toast.success("Success!");
    },
    onError: (err) => {
      console.error("Error marking as shipped:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
}
