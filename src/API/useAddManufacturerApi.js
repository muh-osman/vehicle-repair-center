import { useMutation } from "@tanstack/react-query";
//
import { useNavigate } from "react-router-dom";
// API base
import API from "./Api";
// Cookies
import { useCookies } from "react-cookie";
// Toastify
import { toast } from "react-toastify";

export const useAddManufacturerApi = () => {
  //
  const navigate = useNavigate();
  // Cookies
  //   const [cookies, setCookie] = useCookies(["newModelId"]);

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/manufacturers", data);
      return res.data;
    },

    onSuccess: (responseData) => {
      toast.success("Car Manufacturer Added.");
    //   navigate("/dashboard/add/model");
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
