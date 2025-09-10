import style from "./RefundClientForm.module.scss";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// MUI
import { Backdrop, CircularProgress, Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
// Signature Pad
import SignaturePad from "signature_pad";
// API
import useGetOneRefundClientByRandApi from "../../API/useGetOneRefundClientByRandApi";
import { useUpdateRefundClientApi } from "../../API/useUpdateRefundClientApi";
// dayjs
import dayjs from "dayjs";

export default function RefundClientForm() {
  const [searchParams] = useSearchParams();
  const randParam = searchParams.get("rand");
  //
  const {
    // refetch: fetchGetOneClient,
    data: OneRefundClientData,
    isSuccess: isGetOneclientSuccess,
    isLoading: isGetOneclientLoading,
    isError: isGetOneclientError,
  } = useGetOneRefundClientByRandApi(randParam);

  //
  const {
    mutate,
    isPending: isUpdateRefundClientDataPending,
    isSuccess: isUpdateRefundClientDataSuccess,
    isError,
  } = useUpdateRefundClientApi();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    document.body.style.backgroundColor = "#fbfbfb";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    id_number: "",
    phone_number: "",
    bank_name: "",
    iban: "",
    signature_date: dayjs().format("YYYY-MM-DD"),
  });

  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  // const pdfRef = useRef();

  const signaturePadRef = useRef(null);
  const canvasRef = useRef(null);

  // State for overlay
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayMessage, setOverlayMessage] = useState("");

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

  // Handle overlay based on API data
  useEffect(() => {
    if (isGetOneclientLoading) {
      setShowOverlay(true);
      setOverlayMessage("");
    } else if (isGetOneclientSuccess && OneRefundClientData) {
      if (
        OneRefundClientData.name &&
        OneRefundClientData.phone_number &&
        OneRefundClientData.id_number &&
        OneRefundClientData.bank_name &&
        OneRefundClientData.iban &&
        OneRefundClientData.signature
      ) {
        setOverlayMessage("تم ارسال البيانات");
      } else {
        setShowOverlay(false);
      }
    } else if (isGetOneclientError) {
      setShowOverlay(true);
      setOverlayMessage("خطأ في تحميل البيانات");
    }
  }, [
    isGetOneclientLoading,
    isGetOneclientSuccess,
    isGetOneclientError,
    OneRefundClientData,
  ]);

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

    // Disable signature pad immediately
    if (signaturePadRef.current) {
      signaturePadRef.current.off();
      canvasRef.current.style.pointerEvents = "none";
      canvasRef.current.style.opacity = "0.6";
    }

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

      formDataToSend.append("id", OneRefundClientData?.id);

      await mutate(formDataToSend);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isError) {
      // Re-enable signature pad
      if (signaturePadRef.current) {
        signaturePadRef.current.on();
        canvasRef.current.style.pointerEvents = "auto";
        canvasRef.current.style.opacity = "1";
      }
    }
  }, [isError]);

  useEffect(() => {
    //  if API call is successful
    if (isUpdateRefundClientDataSuccess) {
      setShowOverlay(true);
      setOverlayMessage("تم ارسال البيانات");

      generatePDF();
    }
  }, [isUpdateRefundClientDataSuccess]);

  const generatePDF = async () => {
    try {
      const { name, id_number, phone_number, bank_name, iban, signature_date } =
        formData;

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
          نموذج إقرار استلام وتعهد بالتنازل عن المطالبات
        </h1>

        <p style="margin-bottom: 15px;">
          أنا الموقع أدناه:
        </p>


      <div style="margin-bottom: 32px;">
        <div style="display: flex; text-align: center; width: 100%;">
          <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; font-weight: bold;" >الاسم</div>
          <div dir="rtl" style="text-align: center; border: 1px solid #000; flex: 3; padding: 6px;" >${name}</div>
        </div>
        <div style="display: flex; text-align: center; width: 100%;">
          <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم الهوية/الإقامة</div>
          <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${id_number}</div>
        </div>
        <div style="display: flex; text-align: center; width: 100%;">
          <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم الجوال</div>
          <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${phone_number}</div>
        </div>
        <div style="display: flex; text-align: center; width: 100%;">
          <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم تقرير الفحص</div>
          <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${
            OneRefundClientData?.report_number
          }</div>
        </div>
        <div style="display: flex; text-align: center; width: 100%;">
          <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >تاريخ الفحص</div>
          <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${
            OneRefundClientData.inspection_date.split("T")[0]
          }</div>
        </div>
      </div>

        <p style="margin-bottom: 32px;">
أقر أنا الموقع أدناه بأنني اتفقت مع مؤسسة كاشف التجارية على استلام مبلغًا وقدره <span style="font-weight: bold;">(${
        OneRefundClientData?.amount
      })</span> ريال سعودي, وذلك كتعويض وتسوية عن عملية الفحص في التاريخ المشار إليها أعلاه، على ان يتم تحويلها على بنك <span style="font-weight: bold;">(${bank_name})</span>, حساب ايبان رقم: <span style="font-weight: bold;">(${iban})</span>
        </p>



        <p style="margin-bottom: 15px; font-weight: bold;">
          وبموجب هذا الإقرار:
        </p>

        <div dir="rtl" style="padding-right: 16px; margin-bottom: 32px">
              <p dir="rtl" style="margin-bottom: 12px; direction: rtl;">
                1- أؤكد أنني وافقت على استلام المبلغ المتفق عليه كاملًا، وأنه لا يحق لي
                المطالبة بأي مبالغ إضافية مستقبلًا تتعلق بهذا الخطأ.
              </p>

              <p dir="rtl" style="margin-bottom: 12px;">
                2- أتعهد بعدم إقامة أي دعاوى قضائية أو مطالبات مالية أو قانونية ضد
                مؤسسة كاشف التجارية أو من يمثلها، سواء الآن أو في المستقبل، فيما
                يخص هذا الموضوع.
              </p>
              <p dir="rtl" style="margin-bottom: 12px;">
                3- أعتبر هذا التعويض تسوية نهائية وكاملة، ولا يترتب عليه أي
                التزامات أخرى على مؤسسة كاشف التجارية.
              </p>
              <p dir="rtl">
                4- اقر بعدم الإشارة والتعليق على هذا الموضوع في مواقع التواصل
                الاجتماعي سواءً بالتلميح او التصريح.
              </p>
        </div>


        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin-bottom: 20px;"><span style="font-weight: bold;">حرر هذا الإقرار بتاريخ: </span> <span dir="rtl">${signature_date}</span></p>
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

      pdf.save("refund.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw error;
    }
  };

  return (
    <div className={style.container}>
      {/* Overlay with MUI Spinner */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        open={showOverlay}
      >
        {isGetOneclientLoading && (
          <>
            <CircularProgress color="inherit" />
            <Typography dir="rtl" variant="h6" sx={{ mt: 2 }}>
              جاري تحميل البيانات...
            </Typography>
          </>
        )}

        {overlayMessage && (
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {overlayMessage}
          </Typography>
        )}
      </Backdrop>

      {/*  */}
      <h3
        style={{
          textAlign: "center",
          marginTop: "32px",
          marginBottom: "32px",
          color: "#757575",
          fontWeight: "bold",
        }}
      >
        نموذج إقرار استلام وتعهد بالتنازل عن المطالبات
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
              أنا الموقع أدناه:
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
              disabled={
                loading ||
                isUpdateRefundClientDataPending ||
                isUpdateRefundClientDataSuccess
              }
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
                // Hide arrows for all browsers
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& input[type=number]::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
              }}
              dir="ltr"
              required
              fullWidth
              label="رقم الهوية/الإقامة"
              type="number"
              name="id_number"
              value={formData.id_number}
              onChange={handleInputChange}
              disabled={
                loading ||
                isUpdateRefundClientDataPending ||
                isUpdateRefundClientDataSuccess
              }
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
              label="رقم الجوال"
              placeholder="05xxxxxxxx"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              disabled={
                loading ||
                isUpdateRefundClientDataPending ||
                isUpdateRefundClientDataSuccess
              }
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
              inputProps={{
                minLength: 10,
                maxLength: 10,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                  }}
                  dir="ltr"
                  fullWidth
                  label="رقم تقرير الفحص"
                  value={OneRefundClientData?.report_number || ""}
                  InputLabelProps={{
                    className: "custom-label-rtl",
                    shrink: true, // This forces the label to stay up
                  }}
                  disabled
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  sx={{
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  type="date"
                  label="تاريخ الفحص"
                  value={
                    OneRefundClientData?.inspection_date
                      ? OneRefundClientData.inspection_date.split("T")[0]
                      : ""
                  }
                  InputLabelProps={{
                    className: "custom-label-rtl",
                    shrink: true, // This forces the label to stay up
                  }}
                  disabled
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <p style={{ marginBottom: "0px" }}>
              أقر أنا الموقع أدناه بأنني اتفقت مع مؤسسة كاشف التجارية على استلام
              مبلغًا وقدره{" "}
              <span
                style={{ fontWeight: "bold" }}
              >{`(${OneRefundClientData?.amount} ريال سعودي)`}</span>
              ، وذلك كتعويض وتسوية عن عملية الفحص في التاريخ المشار إليها أعلاه،
              على ان يتم تحويلها على بنك:
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
              label="اسم البنك"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              disabled={
                loading ||
                isUpdateRefundClientDataPending ||
                isUpdateRefundClientDataSuccess
              }
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
                // Hide arrows for all browsers
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& input[type=number]::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
              }}
              dir="ltr"
              required
              fullWidth
              label="رقم ايبان"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              disabled={
                loading ||
                isUpdateRefundClientDataPending ||
                isUpdateRefundClientDataSuccess
              }
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <p style={{ marginBottom: "15px", fontWeight: "bold" }}>
              وبموجب هذا الإقرار:
            </p>

            <ol style={{ paddingRight: "16px", paddingLeft: "0px" }}>
              <li style={{ marginBottom: "12px" }}>
                أؤكد أنني وافقت على استلام المبلغ المتفق عليه كاملًا، وأنه لا
                يحق لي المطالبة بأي مبالغ إضافية مستقبلًا تتعلق بهذا الخطأ.
              </li>

              <li style={{ marginBottom: "12px" }}>
                أتعهد بعدم إقامة أي دعاوى قضائية أو مطالبات مالية أو قانونية ضد
                مؤسسة كاشف التجارية أو من يمثلها، سواء الآن أو في المستقبل، فيما
                يخص هذا الموضوع.
              </li>
              <li style={{ marginBottom: "12px" }}>
                أعتبر هذا التعويض تسوية نهائية وكاملة، ولا يترتب عليه أي
                التزامات أخرى على مؤسسة كاشف التجارية.
              </li>
              <li style={{ marginBottom: "12px" }}>
                اقر بعدم الإشارة والتعليق على هذا الموضوع في مواقع التواصل
                الاجتماعي سواءً بالتلميح او التصريح.
              </li>
            </ol>
          </Grid>

          <Grid item xs={12}>
            <TextField
              sx={{
                backgroundColor: "#fff",
              }}
              dir="ltr"
              required
              fullWidth
              type="date"
              label="حرر هذا الإقرار بتاريخ"
              name="signature_date"
              value={formData.signature_date}
              disabled
              InputLabelProps={{
                className: "custom-label-rtl",
                shrink: true, // This forces the label to stay up
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
                    disabled={
                      loading ||
                      isUpdateRefundClientDataPending ||
                      isUpdateRefundClientDataSuccess
                    }
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
          loading={loading || isUpdateRefundClientDataPending}
          disabled={isUpdateRefundClientDataSuccess}
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
