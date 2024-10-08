import style from "./UnpaidClient.module.scss";
//
import { useEffect, useState } from "react";
// Axios
import axios from "axios";
//
import { useParams } from "react-router-dom";
// MUI
import CircularProgress from "@mui/material/CircularProgress";

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

      {data && (
        <div className={style.table_container} dir="rtl">
          <table>
            <tbody>
              <tr>
                <td>اسم العميل:</td>
                <td>{data?.full_name ? data?.full_name : "غير متوفر"}</td>
              </tr>

              <tr>
                <td>رقم الهاتف:</td>
                <td>{data?.phone ? data?.phone : "غير متوفر"}</td>
              </tr>

              <tr>
                <td>الفرع:</td>
                <td>{data?.branch ? data?.branch : "غير متوفر"}</td>
              </tr>

              <tr>
                <td>المبلغ:</td>
                <td>SAR {data?.price}</td>
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

              {data?.service && (
                <tr>
                  <td>الخدمة:</td>
                  <td>{data?.service}</td>
                </tr>
              )}

              <tr>
                <td>فحص:</td>
                <td>{data?.plan}</td>
              </tr>

              {data?.additionalServices && (
                <tr>
                  <td>الخدمات الاضافية:</td>
                  <td>{data?.additionalServices}</td>
                </tr>
              )}

              <tr>
                <td>موديل:</td>
                <td>{data?.model}</td>
              </tr>

              <tr>
                <td>تاريخ الصنع:</td>
                <td>{data?.year === "2" ? "2015 أو اعلى" : "2014 أو ادنى"}</td>
              </tr>

              <tr>
                <td>تاريخ:</td>
                <td dir="ltr">
                  {data?.created_at ? formatDate(data.created_at) : "غير متوفر"}
                </td>
              </tr>

              <tr>
                <td>ID:</td>
                <td>{data?.un_paid_qr_code}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
