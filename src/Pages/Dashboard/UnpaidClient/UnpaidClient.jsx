import style from "./UnpaidClient.module.scss";
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

const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function UnpaidClient() {
  let { id } = useParams();

  const [data, setData] = useState(null);
  const [loadding, setLoadding] = useState(false);
  const [error, setError] = useState(null);

  const scanUserPayment = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(`${apiUrl}api/get-unpaid-payment/${id}`);
      // console.log(response.data);
      setData(response.data.data);
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
          <Alert severity="warning" dir="rtl">
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
                  {data?.un_paid_qr_code?.full_name
                    ? data?.un_paid_qr_code?.full_name
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>رقم الهاتف:</td>
                <td>
                  {data?.un_paid_qr_code?.phone
                    ? data?.un_paid_qr_code?.phone
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>الفرع:</td>
                <td>
                  {data?.un_paid_qr_code?.branch
                    ? data?.un_paid_qr_code?.branch
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>المبلغ:</td>
                <td dir="rtl">
                  {Math.trunc(data?.un_paid_qr_code?.price)} ريال
                </td>
              </tr>

              <tr>
                <td>كود الخصم:</td>
                <td>{data?.un_paid_qr_code?.discountCode || "-"}</td>
              </tr>

              <tr>
                <td>وسيلة الدفع:</td>
                <td>في المركز</td>
              </tr>

              <tr>
                <td>الحالة:</td>
                <td
                  style={{
                    backgroundColor: "red",
                    color: "#fff",
                  }}
                >
                  دفع في المركز
                </td>
              </tr>

              <tr>
                <td>الخدمة:</td>
                <td>
                  {data?.un_paid_qr_code?.service
                    ? data?.un_paid_qr_code?.service
                    : "العادية"}
                </td>
              </tr>

              <tr>
                <td>الباقة:</td>
                <td>{data?.un_paid_qr_code?.plan}</td>
              </tr>

              <tr>
                <td>الخدمات الاضافية:</td>
                <td>
                  {data?.un_paid_qr_code?.additionalServices
                    ? data?.un_paid_qr_code?.additionalServices
                    : "لا يوجد"}
                </td>
              </tr>

              <tr>
                <td>موديل:</td>
                <td>{data?.un_paid_qr_code?.model}</td>
              </tr>

              <tr>
                <td>تاريخ الصنع:</td>
                <td>
                  {data?.un_paid_qr_code?.full_year
                    ? data.un_paid_qr_code.full_year
                    : data?.un_paid_qr_code?.year === "2"
                    ? "2017 أو أعلى"
                    : "2016 أو أدنى"}
                </td>
              </tr>

              <tr>
                <td>تاريخ:</td>
                <td dir="ltr">
                  {data?.un_paid_qr_code?.created_at
                    ? formatDate(data.un_paid_qr_code.created_at)
                    : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>ID:</td>
                <td>{data?.un_paid_qr_code?.un_paid_qr_code}</td>
              </tr>

              {data?.un_paid_qr_code?.affiliate && (
                <tr>
                  <td>الإحالة:</td>
                  <td>
                    {data?.un_paid_qr_code?.affiliate
                      ? data?.un_paid_qr_code?.affiliate
                      : "N/A"}
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
