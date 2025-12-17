// In your API folder, create a new file: useEditAccountantStatusApi.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const useEditAccountantStatusApi = () => {
  const queryClient = useQueryClient();

  const editAccountantStatus = async (id) => {
    const response = await axios.put(`https://cashif.cc/payment-system/back-end/public/api/shipping-payments/update_accounted_status/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: editAccountantStatus,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["allShippingPaymens"]);
    },
    onError: (error) => {
      console.error("Failed to update accountant status:", error);
    },
  });
};

export default useEditAccountantStatusApi;
