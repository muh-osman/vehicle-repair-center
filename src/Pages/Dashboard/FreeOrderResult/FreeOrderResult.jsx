import style from "./FreeOrderResult.module.scss";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import Chip from "@mui/material/Chip";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
// Api
import useCheckFreeOrderApi from "../../../API/useCheckFreeOrderApi";

export default function FreeOrderResult() {
  let { phoneNumber } = useParams();
  const { data, fetchStatus } = useCheckFreeOrderApi(phoneNumber);

  useEffect(() => {
    console.log(fetchStatus);
  }, [fetchStatus]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-GB", options);
  };

  return (
    <div className={style.container}>
      {fetchStatus === "fetching" && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      {data?.status === "success" && (
        <>
          <CheckCircleIcon sx={{ fontSize: 99, color: "green" }} />
          <h1 dir="rtl">
            خصم <span>{Math.floor(data?.discount_percent)}%</span>
          </h1>
          {/* <h3 style={{ color: "#757575" }}>{phoneNumber}</h3> */}
          <p style={{ color: "#757575" }}>لمرة واحدة فقط</p>
          <Chip
            icon={<PhoneIphoneIcon />}
            label={phoneNumber}
            variant="outlined"
          />
        </>
      )}

      {data?.status === "scanned before" && (
        <>
          <DangerousIcon sx={{ fontSize: 99, color: "red" }} />
          <h1>تم مسح الكود سابقا</h1>
          <h3 style={{ color: "#757575" }}>
            {formatDate(data?.data?.updated_at)} -{" "}
            {formatTime(data?.data?.updated_at)}
          </h3>

          <Chip
            icon={<PhoneIphoneIcon />}
            label={phoneNumber}
            variant="outlined"
          />
        </>
      )}

      {data?.status === "not found" && (
        <>
          <DangerousIcon sx={{ fontSize: 99, color: "red" }} />
          <h1>كود غير موجود</h1>
        </>
      )}

      {data?.status === "expired" && (
        <>
          <DangerousIcon sx={{ fontSize: 99, color: "red" }} />
          <h1>انتهت صلاحية الكود</h1>
          <Chip
            icon={<PhoneIphoneIcon />}
            label={phoneNumber}
            variant="outlined"
          />
        </>
      )}
    </div>
  );
}
