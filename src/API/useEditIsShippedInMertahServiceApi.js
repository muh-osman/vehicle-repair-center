import { useMutation, useQueryClient } from "@tanstack/react-query";
// Toastify
import { toast } from "react-toastify";
//
import axios from "axios";

const markAsShipped = async (qrCode) => {
  const response = await axios.put(`https://cashif.cc/payment-system/back-end/public/api/mertah-service/toggle-is-shipped/${qrCode}`);
  return response.data;
};

export default function useEditIsShippedInMertahServiceApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsShipped,
    onSuccess: () => {
      // Invalidate and refetch
      // queryClient.invalidateQueries({ queryKey: [""] });
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
