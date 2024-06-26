import { useMutation } from "@tanstack/react-query";
//
import { useNavigate } from "react-router-dom";
// API base
import API from "./Api";
// Cookies
import { useCookies } from "react-cookie";
// Toastify
import { toast } from "react-toastify";

export const useAddModelApi = () => {
  //
  const navigate = useNavigate();
  // Cookies
  const [cookies, setCookie] = useCookies(["newModelId"]);

  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post("api/car-models", data);
      return res.data.carModel.id;
    },

    onSuccess: (responseData) => {
      setCookie("newModelId", responseData);
      toast.success("Car model Added, please enter the prices.");
      navigate("/dashboard/add/prices");
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
