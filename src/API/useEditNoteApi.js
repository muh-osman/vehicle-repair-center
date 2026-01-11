import { useMutation, useQueryClient } from "@tanstack/react-query";
// Toastify
import { toast } from "react-toastify";
//
import axios from "axios";

const editNote = async ({ id, note }) => {
  const response = await axios.put(`https://cashif.cc/payment-system/back-end/public/api/shipping-payments/update_note/${id}`, { note: note });
  return response.data;
};

export default function useEditNoteApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editNote,
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
