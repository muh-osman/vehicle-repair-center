import { useQuery } from "@tanstack/react-query";
// API
import API from "./Api";

export const fetchPhoneNumbers = async () => {
  const res = await API.get("api/get-all-accepted-phone-numbers");
  return res.data;
};

export default function useGetPhoneNumberApi() {
  return useQuery({
    queryKey: ["PhoneNumbers"],
    queryFn: () => fetchPhoneNumbers(),
  });
}
