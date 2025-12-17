import style from "./ShippingClient.module.scss";
//
import { useEffect, useState, useRef } from "react";
// Axios
import axios from "axios";
//
import { useParams } from "react-router-dom";
// MUI
import CircularProgress from "@mui/material/CircularProgress";
// html2canvas
import html2canvas from "html2canvas";
// jsPDF
import { jsPDF } from "jspdf";
// Api
const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function ShippingClient() {
  let { id } = useParams();

  const [data, setData] = useState(null);
  const [loadding, setLoadding] = useState(false);
  const [error, setError] = useState(null);

  const scanUserPayment = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(`${apiUrl}api/get-shipping-payment/${id}`);
      // console.log(response.data);
      setData(response.data);
      // console.log(data);

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

  const tableRef = useRef(); // 👈 reference to the table div

  // Download as PNG
  const downloadAsPNG = () => {
    if (!tableRef.current) return;

    html2canvas(tableRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 3,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `shipping_${id}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    });
  };

  // Download as PDF
  // Download as PDF - Single page version
  const downloadAsPDF = () => {
    if (!tableRef.current) return;

    html2canvas(tableRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2, // You can adjust this for better quality
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;

      // Margins for better appearance
      const margin = 10;
      const contentWidth = a4Width - 2 * margin;

      // Calculate dimensions to fit content on single page
      const imgWidth = contentWidth;
      const scaleFactor = imgWidth / canvas.width;
      const imgHeight = canvas.height * scaleFactor;

      // Check if content fits on one page
      const availableHeight = a4Height - 2 * margin;

      if (imgHeight > availableHeight) {
        // If content is too tall, scale it down to fit
        const adjustedScaleFactor = availableHeight / canvas.height;
        const adjustedWidth = canvas.width * adjustedScaleFactor;
        const adjustedHeight = availableHeight;

        // Center horizontally
        const xPos = (a4Width - adjustedWidth) / 2;

        pdf.addImage(imgData, "PNG", xPos, margin, adjustedWidth, adjustedHeight);
      } else {
        // Content fits normally
        // Center vertically if content is shorter than page
        const yPos = margin + (availableHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
      }

      pdf.save(`shipping_${id}_${new Date().getTime()}.pdf`);
    });
  };

  // Combined function with file type selection
  const downloadImage = (fileType = "png") => {
    if (fileType === "png") {
      downloadAsPNG();
    } else if (fileType === "pdf") {
      downloadAsPDF();
    }
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
        <>
          <div ref={tableRef} style={{ padding: "16px", direction: "rtl", wordWrap: "normal", letterSpacing: "normal" }}>
            <div className={style.table_container} style={{ direction: "rtl" }}>
              <div className={style.table_title}>طلب خدمة "شحن سيارة"</div>
              <table>
                <tbody>
                  <tr>
                    <td>الخدمة:</td>
                    <td>شحن سيارة</td>
                  </tr>

                  <tr>
                    <td>نوع الشحن :</td>
                    <td>{data?.metadata?.shippingType ? data?.metadata?.shippingType : "غير متوفر"}</td>
                  </tr>

                  {/* <tr>
                    <td>المبلغ:</td>
                    <td>{data?.amount_format}</td>
                  </tr> */}

                  <tr>
                    <td>الحالة:</td>
                    <td
                    // style={{
                    //   backgroundColor: data?.status === "paid" ? "green" : "red",
                    //   color: data?.status === "paid" ? "#fff" : "#000000DE",
                    // }}
                    >
                      {data?.status}
                    </td>
                  </tr>

                  <tr>
                    <td>موديل:</td>
                    <td>{data?.metadata?.model}</td>
                  </tr>

                  <tr>
                    <td>رقم اللوحة:</td>
                    <td dir="rtl">{data?.metadata?.plateNumber}</td>
                  </tr>

                  <tr>
                    <td>من فرع:</td>
                    <td style={{ backgroundColor: "#d32f2f", color: "#fff" }}>{data?.metadata?.from ? data?.metadata?.from : "غير متوفر"}</td>
                  </tr>

                  <tr>
                    <td>الى مدينة:</td>
                    <td style={{ backgroundColor: "#d32f2f", color: "#fff" }}>{data?.metadata?.to ? data?.metadata?.to : "غير متوفر"}</td>
                  </tr>

                  <tr>
                    <td>اسم العميل:</td>
                    <td>{data?.metadata?.name ? data?.metadata?.name : "غير متوفر"}</td>
                  </tr>

                  <tr>
                    <td>رقم الجوال:</td>
                    <td>{data?.metadata?.phoneNumber ? <a href={`tel:${data.metadata.phoneNumber}`}>{data.metadata.phoneNumber}</a> : "غير متوفر"}</td>
                  </tr>

                  {/* <tr>
                    <td>رقم الكرت:</td>
                    <td>{data?.metadata?.reportNumber ? data?.metadata?.reportNumber : "غير متوفر"}</td>
                  </tr> */}

                  <tr>
                    <td>تاريخ:</td>
                    <td dir="ltr">{data?.created_at ? formatDate(data.created_at) : "غير متوفر"}</td>
                  </tr>

                  {/* <tr>
                    <td>رقم المرجع:</td>
                    <td>{data?.id}</td>
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download buttons section */}
          <div dir="rtl" style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            {/* Option 1: Two separate buttons */}
            <button
              onClick={() => downloadImage("png")}
              style={{
                padding: "12px 18px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "160px",
              }}
            >
              تحميل كصورة (PNG)
            </button>

            <button
              onClick={() => downloadImage("pdf")}
              style={{
                padding: "12px 18px",
                backgroundColor: "#7431fa",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "160px",
              }}
            >
              تحميل كملف (PDF)
            </button>
          </div>

          {/* 👇 DOWNLOAD BUTTON AT BOTTOM */}
          {/* <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={downloadImage}
              style={{
                padding: "12px 18px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              تحميل البيانات كصورة
            </button>
          </div> */}
        </>
      )}
    </div>
  );
}
