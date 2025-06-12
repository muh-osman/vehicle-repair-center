import style from "./TamaraClient.module.scss";
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

export default function TamaraClient() {
  let { id } = useParams();

  const [data, setData] = useState(null);
  const [loadding, setLoadding] = useState(false);
  const [error, setError] = useState(null);

  const scanUserPayment = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(
        `${apiUrl}api/get-tamara-paid-client/${id}`
      );

      setData(response.data);
      //   console.log(response.data);

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

      {data?.data?.date_of_visited && (
        <Stack
          sx={{ width: "100%", direction: "rtl", textAlign: "right" }}
          spacing={2}
          dir="rtl"
        >
          <Alert severity="warning">
            تم مسح الباركود سابقا بتاريخ: {data?.data?.date_of_visited}
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
                  {data?.data?.full_name ? data?.data?.full_name : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>رقم الهاتف:</td>
                <td>{data?.data?.phone ? data?.data?.phone : "غير متوفر"}</td>
              </tr>

              <tr>
                <td>الفرع:</td>
                <td>{data?.data?.branch ? data?.data?.branch : "غير متوفر"}</td>
              </tr>

              <tr>
                <td>المبلغ:</td>
                <td>{data?.data?.price}</td>
              </tr>

              <tr>
                <td>الحالة:</td>
                <td
                  style={{
                    backgroundColor:
                      data?.tamara?.status === "fully_captured"
                        ? "green"
                        : "red",
                    color:
                      data?.tamara?.status === "fully_captured"
                        ? "#fff"
                        : "#000000DE",
                  }}
                >
                  {data?.tamara?.status}
                </td>
              </tr>

              <tr>
                <td>الخدمة:</td>
                <td>{data?.data?.service ? data?.data?.service : "العادية"}</td>
              </tr>

              <tr>
                <td>الباقة:</td>
                <td>{data?.data?.plan}</td>
              </tr>

              <tr>
                <td>الخدمات الاضافية:</td>
                <td>
                  {data?.data?.additionalServices
                    ? data?.data?.additionalServices
                    : "لا يوجد"}
                </td>
              </tr>

              <tr>
                <td>موديل:</td>
                <td>{data?.data?.model}</td>
              </tr>

              <tr>
                <td>تاريخ الصنع:</td>
                <td>
                  {data?.data?.full_year
                    ? data.data.full_year
                    : data?.data?.year === "2"
                    ? "2017 أو أعلى"
                    : "2016 أو أدنى"}
                </td>
              </tr>

              <tr>
                <td>تاريخ الدفع:</td>
                <td dir="ltr">
                  {data?.tamara?.created_at
                    ? formatDate(data.tamara.created_at)
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>Order ID:</td>
                <td>{data?.data?.paid_qr_code}</td>
              </tr>

              {data?.data?.affiliate && (
                <tr>
                  <td>الإحالة:</td>
                  <td>
                    {data?.data?.affiliate ? data?.data?.affiliate : "N/A"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
