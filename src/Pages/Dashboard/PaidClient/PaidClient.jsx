import style from "./PaidClient.module.scss";
//
import { useEffect, useState } from "react";
// Axios
import axios from "axios";
//
import { useParams } from "react-router-dom";
// MUI
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
// Api
const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function PaidClient() {
  let { id } = useParams();

  const [data, setData] = useState(null);
  const [loadding, setLoadding] = useState(false);
  const [error, setError] = useState(null);

  const scanUserPayment = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(`${apiUrl}api/get-paid-payment/${id}`);
      // console.log(response.data);
      setData(response.data);
      console.log(data);

      setLoadding(false);
    } catch (err) {
      console.log(err);
      setLoadding(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    scanUserPayment();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options).replace(",", " at");
  };

  return (
    <div className={style.container}>
      {error ? (
        <pre>{error}</pre>
      ) : loadding ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "33vh",
          }}
        >
          <CircularProgress size={32} sx={{ color: "primary" }} />
        </div>
      ) : null}

      {data?.date_of_visited && (
        <Stack
          sx={{ width: "100%", direction: "rtl", textAlign: "right" }}
          spacing={2}
          dir="rtl"
        >
          <Alert severity="warning">
            تم مسح الباركود سابقا بتاريخ: {data?.date_of_visited}
          </Alert>
        </Stack>
      )}

      {data && (
        <div className={style.table_container} dir="rtl">
          <table>
            <tbody>
              <tr>
                <td>اسم العميل:</td>
                <td>
                  {data?.metadata?.name ? data?.metadata?.name : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>رقم الهاتف:</td>
                <td>
                  {data?.metadata?.phone ? data?.metadata?.phone : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>الفرع:</td>
                <td>
                  {data?.metadata?.branch
                    ? data?.metadata?.branch
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>المبلغ:</td>
                <td>{data?.amount_format}</td>
              </tr>

              <tr>
                <td>الحالة:</td>
                <td
                  style={{
                    backgroundColor: data?.status === "paid" ? "green" : "red",
                    color: data?.status === "paid" ? "#fff" : "#000000DE",
                  }}
                >
                  {data?.status}
                </td>
              </tr>

              <tr>
                <td>الخدمة:</td>
                <td>
                  {data?.metadata?.service
                    ? data?.metadata?.service
                    : "العادية"}
                </td>
              </tr>

              <tr>
                <td>الباقة:</td>
                <td>{data?.metadata?.plan}</td>
              </tr>

              <tr>
                <td>الخدمات الاضافية:</td>
                <td>
                  {data?.metadata?.additionalServices
                    ? data?.metadata?.additionalServices
                    : "لا يوجد"}
                </td>
              </tr>

              <tr>
                <td>موديل:</td>
                <td>{data?.metadata?.model}</td>
              </tr>

              <tr>
                <td>تاريخ الصنع:</td>
                <td>
                  {data?.metadata?.year === "2"
                    ? "2015 أو اعلى"
                    : "2014 أو ادنى"}
                </td>
              </tr>

              <tr>
                <td>تاريخ:</td>
                <td dir="ltr">
                  {data?.created_at ? formatDate(data.created_at) : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>رقم المرجع:</td>
                <td>{data?.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
