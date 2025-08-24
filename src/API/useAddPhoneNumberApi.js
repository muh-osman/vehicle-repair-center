import { useMutation, useQueryClient } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";
// Api
import { fetchPhoneNumbers } from "./useGetPhoneNumberApi";

export const useAddPhoneNumberApi = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/post-accepted-phone-number", data);
      return res.data;
    },

    onSuccess: () => {
      qc.prefetchQuery({
        queryKey: ["PhoneNumbers"],
        queryFn: () => fetchPhoneNumbers(),
      });
    },

    onError: (err) => {
      console.error(err);
      const errorMessage =
        err.response.data.errors.accepted_phone_number[0] ||
        err?.message ||
        "An error occurred";
      // Toastify
      toast.error(errorMessage);
    },
  });
};
