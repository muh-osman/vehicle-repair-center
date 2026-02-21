// VideosAnalytics.jsx
import style from "./VideosAnalytics.module.scss";
import { useState } from "react";
import VideosAnalyticsApi from "../../../API/VideosAnalyticsApi";

// MUI
import { Box, Typography, CircularProgress, Divider, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function VideosAnalytics() {
  // Assign consistent striped color per report number
  const getReportRowColor = (reportNumber, indexMap) => {
    if (!indexMap.has(reportNumber)) {
      indexMap.set(reportNumber, indexMap.size);
    }
    const groupIndex = indexMap.get(reportNumber);
    return groupIndex % 2 === 0 ? "#f2f2f2" : "#fff";
  };

  // Input fields
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Applied filters
  const [applyFrom, setApplyFrom] = useState("");
  const [applyTo, setApplyTo] = useState("");

  // React Query Hook
  const { data, isPending, isError, fetchStatus } = VideosAnalyticsApi(applyFrom, applyTo);

  const noFilterApplied = !applyFrom || !applyTo;

  return (
    <div className={style.container}>
      {/* <Typography variant="h4" mb={3}>
        Videos Analytics
      </Typography> */}

      {/* ===== Date Filter ===== */}
      <Box className={style.datepicker_Box} display="flex" gap={2} mb={3}>
        <TextField type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <TextField type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
        <Button
          variant="contained"
          onClick={() => {
            setApplyFrom(from);
            setApplyTo(to);
          }}
          disabled={!from || !to}
        >
          Apply
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ===== No Filter ===== */}
      {noFilterApplied && (
        <Typography align="center" mt={4} color="text.secondary">
          Please select a date range and click Apply
        </Typography>
      )}

      {/* ===== Loading ===== */}
      {fetchStatus === "fetching" && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* ===== Error ===== */}
      {isError && (
        <Typography color="error" align="center" mt={3}>
          Failed to load analytics data
        </Typography>
      )}

      {/* ===== DATA TABLE 1 ===== */}
      {data?.success && !isPending && (
        <>
          <Typography variant="h6" mb={2}>
            Employee Performance Summary
          </Typography>

          <Paper sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">الموظف</TableCell>
                  <TableCell align="center">اجمالي التقارير</TableCell>
                  <TableCell align="center">شرح التقرير</TableCell>
                  <TableCell align="center">فيديو للسيارة</TableCell>
                  <TableCell align="center">المجموع</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.employee_summary.map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{emp.employee_name}</TableCell>
                    <TableCell align="center">{emp.reports_count}</TableCell>
                    <TableCell align="center">{emp.sharh_count}</TableCell>
                    <TableCell align="center">{emp.car_count}</TableCell>
                    <TableCell align="center">{emp.total_videos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* ===== DATA TABLE 2 ===== */}
          <Typography variant="h6" mb={2}>
            Videos Details
          </Typography>

          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">الموظف</TableCell>
                  <TableCell align="center">التقرير</TableCell>
                  <TableCell align="center">شرح التقرير</TableCell>
                  <TableCell align="center">فيديو للسيارة</TableCell>
                  <TableCell align="center">تاريخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const reportIndexMap = new Map();

                  return data.data.videos_details.map((vid, index) => {
                    const bgColor = getReportRowColor(vid.report_number, reportIndexMap);

                    return (
                      <TableRow key={index} sx={{ backgroundColor: bgColor }}>
                        <TableCell align="center">{vid.employee_name}</TableCell>
                        <TableCell align="center">{vid.report_number}</TableCell>

                        <TableCell align="center">{vid.video_type === "شرح التقرير" ? <CheckCircleIcon color="success" fontSize="small" /> : ""}</TableCell>

                        <TableCell align="center">{vid.video_type === "فيديو للسيارة" ? <CheckCircleIcon color="success" fontSize="small" /> : ""}</TableCell>

                        <TableCell align="center">{vid.uploaded_at}</TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </div>
  );
}
