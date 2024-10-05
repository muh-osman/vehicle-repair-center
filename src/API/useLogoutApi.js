import { useMutation } from "@tanstack/react-query";
// API base
import API from "./Api";
// Cookies
import { useCookies } from "react-cookie";

export const useLogoutApi = () => {
  // Cookies
  const [cookies, setCookie, removeCookie] = useCookies([
    "token",
    "verified",
    "role",
  ]);

  return useMutation({
    mutationFn: async () => {
      const res = await API.post("api/logout");
      return res.data;
    },

    onSuccess: () => {
      removeCookie("verified", { path: "/" });
      removeCookie("role", { path: "/" });
      removeCookie("token", { path: "/" });
    },

    onError: (err) => {
      console.error(err);
      removeCookie("verified", { path: "/" });
      removeCookie("role", { path: "/" });
      removeCookie("token", { path: "/" });
    },
  });
};
