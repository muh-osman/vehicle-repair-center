import style from "./DisclaimerForm.module.scss";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// MUI
import Fab from "@mui/material/Fab";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
// Signature Pad
import SignaturePad from "signature_pad";
// API
import { useAddDisclaimersApi } from "../../../API/useAddDisclaimersApi";

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

export default function DisclaimerForm() {
  const navigate = useNavigate();
  //
  const {
    mutate,
    isPending: isAddDisclaimersPending,
    isSuccess: isAddDisclaimersSuccess,
  } = useAddDisclaimersApi();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    plate_letter1: "",
    plate_letter2: "",
    plate_letter3: "",
    plate_number: "",
    car_type: "",
    report_number: "",
    name: "",
    date: getTodayDate(),
  });

  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  // const pdfRef = useRef();

  const signaturePadRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize signature pad
  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      // Handle window resize
      const handleResize = () => {
        const canvas = canvasRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePadRef.current.clear(); // Clear on resize to avoid artifacts
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  // Ensure date is always today on mount
  useEffect(() => {
    setFormData((prev) => ({ ...prev, date: getTodayDate() }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;

    if (signaturePadRef.current.isEmpty()) {
      alert("الرجاء تقديم التوقيع");
      return;
    }

    setLoading(true);
    try {
      const signatureDataURL = signaturePadRef.current.toDataURL();
      const response = await fetch(signatureDataURL);
      const blob = await response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      formDataToSend.append("signature", file);

      await mutate(formDataToSend);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset form if API call is successful
    if (isAddDisclaimersSuccess) {
      generatePDF();

      setFormData({
        plate_letter1: "",
        plate_letter2: "",
        plate_letter3: "",
        plate_number: "",
        car_type: "",
        report_number: "",
        name: "",
        date: getTodayDate(),
      });

      // Clear signature
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    }
  }, [isAddDisclaimersSuccess]);

  const generatePDF = async () => {
    try {
      const {
        plate_letter1,
        plate_letter2,
        plate_letter3,
        plate_number,
        car_type,
        report_number,
        name,
        date,
      } = formData;

      // Get signature data URL
      const signatureData = signaturePadRef.current.isEmpty()
        ? ""
        : signaturePadRef.current.toDataURL();

      // Create a temporary div for PDF content
      const pdfContent = document.createElement("div");
      pdfContent.style.cssText = `
        direction: rtl;
        text-align: right;
        padding: 30px;
        background: white;
        width: 800px;
        font-size: 14px;
        line-height: 1.6;
      `;

      pdfContent.innerHTML = `
        <h1 style="text-align: center; font-size: 18px; margin-top: 32px; margin-bottom: 32px; font-weight: bold;">
          نموذج إقرار وإخلاء مسؤولية عن التجربة الميدانية للمركبة
        </h1>

        <p style="margin-bottom: 15px;">
          أقر أنا الموقع أدناه بأني مالك أو المفوض على المركبة ذات البيانات التالية:
        </p>

        <p style="margin-bottom: 15px; font-weight: bold;">
          رقم اللوحة:
        </p>

        <div style="display: flex; margin-bottom: 15px; border: 1px solid #000;">
          <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter1}</div>
          <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter2}</div>
          <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter3}</div>
          <div style="flex: 1; padding: 10px; text-align: center;">${plate_number}</div>
        </div>

        <p style="margin-bottom: 8px;"><span style="font-weight: bold;">نوع السيارة:</span> ${car_type}</p>
        <p style="margin-bottom: 15px;"><span style="font-weight: bold;">رقم التقرير:</span> ${report_number}</p>

        <p style="margin-bottom: 15px;">
          وقد تم إبلاغي من قبل (مؤسسة كاشف التجارية) بأن حالة المركبة قد لا تكون مناسبة فنياً للتجربة الميدانية، وأنه قد يترتب على ذلك أعطال فنية خلال أو بعد التجربة.
        </p>

        <p style="margin-bottom: 24px;">
          وبناء عليه، أوافق على إجراء التجربة الميدانية على مسؤوليتي الشخصية، وأخلي طرف المؤسسة وفنييها من أي مسؤولية عن أي أعطال أو أضرار قد تنتج عن هذه التجربة.
        </p>

        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin-bottom: 8px;"><span style="font-weight: bold;">الاسم:</span> ${name}</p>
            <p style="margin-bottom: 20px;"><span style="font-weight: bold;">التاريخ:</span> ${date}</p>
          </div>

          <div>
            <p style="font-weight: bold; margin-bottom: 5px;">التوقيع:</p>
            ${
              signatureData
                ? `<img src="${signatureData}" style="max-width: 200px; max-height: 80px;" />`
                : ""
            }
          </div>
        </div>
      `;

      // Add to DOM temporarily
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remove from DOM
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("disclaimer.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw error;
    }
  };

  return (
    <div className={style.container}>
      {/* MUI Floationf Button */}
      <Tooltip title="All disclaimer" placement="left">
        <Fab
          color="secondary"
          aria-label="table"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate("/dashboard/disclaimer-table")}
        >
          <TableChartIcon />
        </Fab>
      </Tooltip>

      {/*  */}
      <h3
        style={{
          textAlign: "center",
          marginTop: "16px",
          marginBottom: "32px",
          color: "#757575",
          fontWeight: "bold",
        }}
      >
        نموذج إقرار وإخلاء مسؤولية عن التجربة الميدانية للمركبة
      </h3>

      <Box
        component="form"
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 3,
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          direction: "rtl",
        }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <p dir="rtl" style={{ marginBottom: "0px" }}>
              أقر أنا الموقع أدناه بأني مالك أو المفوض على المركبة ذات البيانات
              التالية:
            </p>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item xs={2}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  required
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                    },
                  }}
                  name="plate_letter1"
                  value={formData.plate_letter1}
                  onChange={handleInputChange}
                  disabled={loading || isAddDisclaimersPending}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  required
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                    },
                  }}
                  name="plate_letter2"
                  value={formData.plate_letter2}
                  onChange={handleInputChange}
                  disabled={loading || isAddDisclaimersPending}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  required
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                    },
                  }}
                  name="plate_letter3"
                  value={formData.plate_letter3}
                  onChange={handleInputChange}
                  disabled={loading || isAddDisclaimersPending}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                    width: "100%",
                  }}
                  dir="ltr"
                  required
                  inputProps={{
                    maxLength: 6,
                  }}
                  name="plate_number"
                  value={formData.plate_number}
                  onChange={handleInputChange}
                  label="أرقام اللوحة"
                  disabled={loading || isAddDisclaimersPending}
                  InputLabelProps={{
                    className: "custom-label-rtl",
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
              }}
              dir="rtl"
              required
              fullWidth
              label="نوع السيارة"
              name="car_type"
              value={formData.car_type}
              onChange={handleInputChange}
              disabled={loading || isAddDisclaimersPending}
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
              }}
              dir="ltr"
              required
              fullWidth
              label="رقم التقرير"
              name="report_number"
              value={formData.report_number}
              onChange={handleInputChange}
              disabled={loading || isAddDisclaimersPending}
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <p style={{ marginBottom: "15px" }}>
              وقد تم إبلاغي من قبل (مؤسسة كاشف التجارية) بأن حالة المركبة قد لا
              تكون مناسبة فنياً للتجربة الميدانية، وأنه قد يترتب على ذلك أعطال
              فنية خلال أو بعد التجربة.
            </p>

            <p style={{ marginBottom: "15px" }}>
              وبناء عليه، أوافق على إجراء التجربة الميدانية على مسؤوليتي
              الشخصية، وأخلي طرف المؤسسة وفنييها من أي مسؤولية عن أي أعطال أو
              أضرار قد تنتج عن هذه التجربة.
            </p>
          </Grid>

          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
              }}
              dir="rtl"
              required
              fullWidth
              label="الاسم"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading || isAddDisclaimersPending}
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
              }}
              dir="rtl"
              required
              fullWidth
              label="التاريخ"
              name="date"
              // InputLabelProps={{ shrink: true }}
              value={formData.date}
              // disabled
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          {/* Signature Pad */}
          <Grid item xs={12}>
            <div style={{ direction: "rtl", position: "relative" }}>
              <p style={{ marginBottom: "8px", color: "#0009" }}>التوقيع:</p>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#fff",
                  marginBottom: "8px",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    touchAction: "none",
                  }}
                />
              </div>
              <div style={{ position: "absolute", left: 0, bottom: 0 }}>
                <Tooltip title="مسح التوقيع" placement="top">
                  <IconButton
                    onClick={clearSignature}
                    disabled={loading || isAddDisclaimersPending}
                    color="error"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(245, 245, 245, 0.9)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Grid>
        </Grid>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={loading || isAddDisclaimersPending}
          sx={{
            mt: 3,
            mb: 2,
            transition: "0.1s",
          }}
        >
          موافق
        </LoadingButton>
      </Box>
    </div>
  );
}
