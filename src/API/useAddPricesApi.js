import { useMutation } from "@tanstack/react-query";
// API base
import API from "./Api";
// Cookies
import { useCookies } from "react-cookie";
// Toastify
import { toast } from "react-toastify";

export const useAddPricesApi = () => {
  // Cookies
  const [cookies, setCookie, removeCookie] = useCookies(["newModelId"]);

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/prices", data);
      return res.data;
    },

    onSuccess: () => {
      removeCookie("newModelId");
      toast.success("Car prices Added.");
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
