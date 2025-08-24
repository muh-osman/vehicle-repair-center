import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";


export const useAddReportApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/post-pdf-report", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      qc.prefetchQuery({
        queryKey: ["reports"],
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err?.response?.data?.errors?.report_number[0] ||
        err?.response?.data?.errors?.pdf_file[0] ||
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
