import { Outlet, Navigate } from "react-router-dom";
// Cookies
import { useCookies } from "react-cookie";

export default function SuperAuth() {
  const [cookies, setCookie] = useCookies(["role"]);

  // console.log(cookies.token);

  return cookies.role === 255 ? <Outlet /> : <Navigate to="/login" />;
}
