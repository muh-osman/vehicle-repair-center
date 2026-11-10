import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./MojazAnalytics.module.scss";

import { BarChart } from "@mui/x-charts/BarChart";
import { Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";

const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function MojazAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${apiUrl}api/mojaz/count/monthly-count-last-12-months`);

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();

        setData(json.data || []);
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const chartData = useMemo(() => {
    const labels = data.map((item) => `${item.month}`);
    const values = data.map((item) => Number(item.orders || 0));
    return { labels, values };
  }, [data]);

  return (
    <div className={style.container}>
      <Card className={style.card}>
        <CardContent className={style.card_content}>
          <Button variant="outlined" onClick={() => navigate("/dashboard/mojaz-reports")} sx={{ mb: 2 }}>
            Back
          </Button>
          <Typography variant="h6" className={style.title}>
            Mojaz Orders Analytics (Last 12 Months)
          </Typography>

          {loading && (
            <div className={style.center}>
              <CircularProgress />
            </div>
          )}

          {!loading && err && (
            <div className={style.error}>
              <Typography color="error">{err}</Typography>
            </div>
          )}

          {!loading && !err && data.length > 0 && (
            <div className={style.chartWrapper}>
              <BarChart
                grid={{ horizontal: true }}
                barLabel="value"
                xAxis={[
                  {
                    scaleType: "band",
                    data: chartData.labels,
                  },
                ]}
                series={[
                  {
                    data: chartData.values,
                  },
                ]}
                height={360}
                margin={{ top: 10, bottom: 30, left: 30, right: 0 }}
              />
            </div>
          )}

          {!loading && !err && data.length === 0 && <Typography>No data found.</Typography>}
        </CardContent>
      </Card>
    </div>
  );
}
