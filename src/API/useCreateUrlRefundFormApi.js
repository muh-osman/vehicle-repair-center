import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useCreateUrlRefundFormApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      // console.log(data.get("report_number"));
      // console.log(data.get("amount"));
      // console.log(data.get("inspection_date"));
      // console.log(data.get("url"));
      // console.log(data.get("random_number"));

      const res = await API.post("api/create-refund-client", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      qc.prefetchQuery({
        queryKey: ["allRefoundClients"],
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
