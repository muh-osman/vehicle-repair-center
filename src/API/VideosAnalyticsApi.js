import { useQuery } from "@tanstack/react-query";
import API from "./Api";

const VideosAnalyticsApi = (from, to) => {
  return useQuery({
    queryKey: ["videos-analytics", from, to],
    queryFn: async () => {
      const res = await API.get(`/api/videos-reports-analytics?from=${from}&to=${to}`);
      return res.data;
    },
    enabled: Boolean(from && to), // 👈 prevents auto run
  });
};

export default VideosAnalyticsApi;
