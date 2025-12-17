import style from "./Reports.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
// API
import useGetAllReportsApi from "../../../API/useGetAllReportsApi";
import { useAddReportApi } from "../../../API/useAddReportApi";
import { useDeleteReportApi } from "../../../API/useDeleteReportApi";
// Toastify
import { toast } from "react-toastify";

export default function Reports() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddReportPending } = useAddReportApi();
  const { mutate: mutateDeleteReport, isPending: isDeleteReportPending } =
    useDeleteReportApi();
  const { data, isPending: isGetAllReportsPending } = useGetAllReportsApi();

  const [formData, setFormData] = useState({
    report_number: "",
    pdf_file: null,
  });

  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      pdf_file: e.target.files[0],
    }));
  };

  // Submit form
  const modelFormRef = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const isValid = modelFormRef.current.reportValidity();
    if (!isValid) return;

    if (!formData.pdf_file) {
      toast.error("Please select a PDF file");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("report_number", formData.report_number);
    submitData.append("pdf_file", formData.pdf_file);

    mutate(submitData, {
      onSuccess: () => {
        toast.success("Report submitted successfully!");
        // Reset form after successful submission
        setFormData({
          report_number: "",
          pdf_file: null,
        });
        // Clear file input
        if (modelFormRef.current) {
          modelFormRef.current.reset();
        }
      },
    });
  };

  // Handle delete report
  const handleDeleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      setDeletingId(reportId); // Set the ID of the report being deleted
      mutateDeleteReport(reportId, {
        onSuccess: () => {
          toast.success("Report deleted successfully!");
        },
        onSettled: () => {
          setDeletingId(null); // Reset deleting ID when operation completes
        },
      });
    }
  };
  return (
    <div className={style.container}>
      {isGetAllReportsPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

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
        <InsertDriveFileIcon sx={{ fontSize: "75px" }} />
      </Avatar>
      {/* Start Form */}
      <Box
        onSubmit={handleSubmit}
        ref={modelFormRef}
        component="form"
        noValidate
        sx={{
          mt: 3,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Start report number input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="ltr"
              fullWidth
              label="رقم التقرير"
              type="text"
              name="report_number"
              disabled={isAddReportPending}
              required
              value={formData.report_number}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        {/* End report number input */}

        {/* Start pdf file input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="ltr"
              fullWidth
              type="file"
              inputProps={{ accept: "application/pdf" }}
              name="pdf_file"
              onChange={handleFileChange}
              required
              disabled={isAddReportPending}
            />
          </Grid>
        </Grid>
        {/* End pdf file input */}

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isAddReportPending}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          Add
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
      {/* End Form one */}

      <p
        style={{
          marginTop: "64px",
          width: "fit-content",
          padding: "0 6px",
          borderRadius: "3px",
        }}
      >
        Mojaz reports
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr">
          <table>
            <thead>
              <tr>
                <th>Card Number</th>
                <th>Date</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((report) => (
                <tr key={report.id}>
                  <td>{report.report_number}</td>

                  <td>
                    {new Date(report.created_at).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    <a
                      href={report.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  </td>

                  <td>
                    <LoadingButton
                      type="button"
                      fullWidth
                      variant="contained"
                      disableRipple
                      color="error"
                      onClick={() => handleDeleteReport(report.id)}
                      loading={deletingId === report.id} // Only show loading for this specific button
                      disabled={deletingId !== null && deletingId !== report.id} // Disable other buttons while one is loading
                    >
                      Delete
                    </LoadingButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
