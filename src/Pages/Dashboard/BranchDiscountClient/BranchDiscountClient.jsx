import style from "./BranchDiscountClient.module.scss";

import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import Chip from "@mui/material/Chip";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
// npm install --save html-to-image --legacy-peer-deps
import { toPng } from "html-to-image";
// Api
import useCheckBranchDiscountApi from "../../../API/useCheckBranchDiscountApi";
// Img
import logo from "../../../Assets/Images/logo.png";

export default function BranchDiscountClient() {
  let { branch } = useParams();
  const { data, fetchStatus } = useCheckBranchDiscountApi(branch);

  useEffect(() => {
    console.log(fetchStatus);
  }, [fetchStatus]);

  // Ref for the ticket element to capture
  const ticketRef = useRef(null);
  // Track if we've already downloaded to avoid re-triggering
  const hasDownloaded = useRef(false);

  // ─── Shared download function ───────────────────────────────────────────────
  const downloadTicket = () => {
    if (ticketRef.current) {
      setTimeout(() => {
        toPng(ticketRef.current, {
          backgroundColor: "#ffffff",
          quality: 1,
        })
          .then((dataUrl) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `discount-ticket-${branch}-${timestamp}.png`;

            // Desktop: trigger download directly
            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("Error saving ticket as image:", error);
          });
      }, 500); // 500ms delay to ensure modal is rendered
    }
  };

  // ─── Auto-download once on success ──────────────────────────────────────────
  useEffect(() => {
    if (data?.status === "success" && fetchStatus === "idle" && ticketRef.current && !hasDownloaded.current) {
      hasDownloaded.current = true;
      downloadTicket();
    }
  }, [data, fetchStatus]);

  //
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  return (
    <div className={style.container} style={{ padding: "16px" }}>
      {fetchStatus === "fetching" && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      {data?.status === "success" && (
        <div>
          <div
            ref={ticketRef}
            style={{ border: "4px solid #174545", borderRadius: "16px", textAlign: "center", display: "inline-block", padding: "24px", backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", gap: "16px", flexDirection: "column", justifyContent: "center", alignItems: "center", marginBottom: "32px" }}>
              <div style={{ width: "100px" }}>
                <img style={{ width: "100%" }} src={logo} alt="cashif logo" />
              </div>
              <h5 style={{ color: "#757575", textAlign: "center", lineHeight: "1.5", marginBottom: "16px" }}>
                يرجى الاحتفاظ بهذه التذكرة وتقديمها لموظف الاستقبال في كاشف للاستفادة من الخصم
              </h5>
            </div>

            <div>
              <CheckCircleIcon sx={{ fontSize: 75, color: "green", marginBottom: "16px" }} />
              <h1 dir="rtl" style={{ marginBottom: "16px" }}>
                خصم <span>{Math.floor(data?.discount_percent)}%</span>
              </h1>
              {/* <h5 style={{ color: "#757575", textAlign: "center", lineHeight: "1.5", marginBottom: "16px" }}>
              يرجى الاحتفاظ بهذه التذكرة وتقديمها لموظف الاستقبال في كاشف للاستفادة من الخصم
            </h5> */}
              <p style={{ color: "#757575" }}>صالح حتى {formatDate(data?.data?.valid_until)}</p>
              <Chip icon={<LocationOnIcon />} label={`خاص بفرع ${data?.data?.branch_name}`} variant="outlined" />
            </div>
          </div>

          {/* ── Manual download button (outside ticket so it won't appear in image) ── */}
          <Button onClick={downloadTicket} variant="contained" size="large" style={{ marginTop: "24px", display: "block", width: "100%", backgroundColor: "#174545" }}>
            حفظ التذكرة
          </Button>
        </div>
      )}

      {/* {data?.status === "scanned before" && (
        <>
          <DangerousIcon sx={{ fontSize: 99, color: "red" }} />
          <h1>تم مسح الكود سابقا</h1>
          <h3 style={{ color: "#757575" }}>
            {formatDate(data?.data?.updated_at)} - {formatTime(data?.data?.updated_at)}
          </h3>

          <Chip icon={<LocationOnIcon />} label={branch} variant="outlined" />
        </>
      )} */}

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
          <p style={{ color: "#757575" }}>صالح حتى {formatDate(data?.data?.valid_until)}</p>
          <Chip icon={<LocationOnIcon />} label={`خاص بفرع ${data?.data?.branch_name}`} variant="outlined" />
        </>
      )}
    </div>
  );
}
