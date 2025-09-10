import style from "./RefundForm.module.scss";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
// MUI
import Fab from "@mui/material/Fab";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Tooltip } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import Avatar from "@mui/material/Avatar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// Toastify
import { toast } from "react-toastify";
// API
import { useCreateUrlRefundFormApi } from "../../../API/useCreateUrlRefundFormApi";

export default function RefundForm() {
  const navigate = useNavigate();
  //
  const {
    mutate,
    isPending: isCreateUrlRefundFormPending,
    isSuccess: isCreateUrlRefundFormSuccess,
  } = useCreateUrlRefundFormApi();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [randomNumber, setRandomNumber] = useState(
    Date.now() + Math.random().toString(36).substr(2, 9)
  );

  // http://localhost:3000  OR
  // https://cashif.online
  const [url, setUrl] = useState(
    `${window.location.origin}/refund-form/?rand=${randomNumber}`
  );

  const [formData, setFormData] = useState({
    report_number: "",
    amount: "",
    inspection_date: null,
  });

  const formRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;

    if (!formData.inspection_date) {
      toast.warn("أدخل تاريخ الفحص");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Format the date to YYYY-MM-DD to avoid timezone issues
      const formattedDate = formData.inspection_date.format("YYYY-MM-DD");

      Object.entries({
        ...formData,
        inspection_date: formattedDate,
      }).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      formDataToSend.append("random_number", randomNumber);
      formDataToSend.append("url", url);

      await mutate(formDataToSend);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isCreateUrlRefundFormSuccess) {
      toast.success("تم إنشاء الرابط");
    }
  }, [isCreateUrlRefundFormSuccess]);

  const handleClick = () => {
    navigator.clipboard.writeText(url);
    toast.success("تم النسخ");
  };

  return (
    <div className={style.container}>
      {/* MUI Floationf Button */}

      <Tooltip title="All refund clients" placement="left">
        <Fab
          color="secondary"
          aria-label="table"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate("/dashboard/refund-table")}
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
        نموذج إقرار استلام وتعهد بالتنازل عن المطالبات
      </h3>

      <Avatar
        sx={{
          margin: "auto",
          marginBottom: "0px",
          bgcolor: "transparent",
          color: "#757575",
          width: "100px",
          height: "100px",
        }}
      >
        <CurrencyExchangeIcon sx={{ fontSize: "75px" }} />
      </Avatar>

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
              label="رقم التقرير"
              type="number"
              name="report_number"
              value={formData.report_number}
              onChange={handleInputChange}
              disabled={
                isCreateUrlRefundFormPending || isCreateUrlRefundFormSuccess
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
              label="المبلغ"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              disabled={
                isCreateUrlRefundFormPending || isCreateUrlRefundFormSuccess
              }
              InputLabelProps={{
                className: "custom-label-rtl",
              }}
            />
          </Grid>

          <Grid item xs={12} dir="ltr">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  sx={{ backgroundColor: "#fff", width: "100%" }}
                  label="تاريخ الفحص"
                  format="DD/MM/YYYY"
                  value={formData.inspection_date}
                  onChange={(value) =>
                    setFormData({ ...formData, inspection_date: value })
                  }
                  maxDate={dayjs()}
                  disabled={
                    isCreateUrlRefundFormPending || isCreateUrlRefundFormSuccess
                  }
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
        </Grid>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isCreateUrlRefundFormPending}
          disabled={isCreateUrlRefundFormSuccess}
          sx={{
            mt: 3,
            mb: 2,
            transition: "0.1s",
          }}
        >
          إنشاء رابط
        </LoadingButton>

        {isCreateUrlRefundFormSuccess && (
          <div dir="ltr" className={style.bio}>
            <p>{url}</p>
            <button type="button" onClick={handleClick}>
              <ContentCopyIcon />
            </button>
          </div>
        )}
      </Box>
    </div>
  );
}
