import { useEffect, useMemo, useState } from "react";
import style from "./OrdersAnalytics.module.scss";

import { BarChart } from "@mui/x-charts/BarChart";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";

export default function OrdersAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("https://cashif.cc/payment-system/back-end/public/api/orders/monthly-count-last-12-months");

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();

        // expected: { message: "...", data: [...] }
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
          <Typography variant="h6" className={style.title}>
            Orders Analytics (Last 12 Months)
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
