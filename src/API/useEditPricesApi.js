import { useMutation } from "@tanstack/react-query";
// API base
import API from "./Api";
// Toastify
import { toast } from "react-toastify";

export const useEditPricesApi = () => {

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.put(`api/prices/${data.car_model_id}`, data);
      return res.data;
    },

    onSuccess: () => {
      toast.success("Car prices edited.");
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
