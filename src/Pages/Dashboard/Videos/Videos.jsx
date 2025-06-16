import style from "./Videos.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
// API
import useGetAllVideosApi from "../../../API/useGetAllVideosApi";
import { useAddVideoApi } from "../../../API/useAddVideoApi";
import { useDeleteVideoApi } from "../../../API/useDeleteVideoApi";
// Toastify
import { toast } from "react-toastify";

export default function Videos() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddVideoPending } = useAddVideoApi();
  const { mutate: mutateDeleteVideo, isPending: isDeleteVideoPending } =
    useDeleteVideoApi();
  const { data, isPending: isGetAllVideosPending } = useGetAllVideosApi();

  const [formData, setFormData] = useState({
    report_number: "",
    video_file: null,
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
      video_file: e.target.files[0],
    }));
  };

  // Submit form
  const modelFormRef = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const isValid = modelFormRef.current.reportValidity();
    if (!isValid) return;

    if (!formData.video_file) {
      toast.error("Please select a video file");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("report_number", formData.report_number);
    submitData.append("video_file", formData.video_file);

    mutate(submitData, {
      onSuccess: () => {
        toast.success("Video submitted successfully!");
        // Reset form after successful submission
        setFormData({
          report_number: "",
          video_file: null,
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
    if (window.confirm("Are you sure you want to delete this video?")) {
      setDeletingId(reportId); // Set the ID of the report being deleted
      mutateDeleteVideo(reportId, {
        onSuccess: () => {
          toast.success("Video deleted successfully!");
        },
        onSettled: () => {
          setDeletingId(null); // Reset deleting ID when operation completes
        },
      });
    }
  };
  return (
    <div className={style.container}>
      {isGetAllVideosPending && (
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
        <VideocamIcon sx={{ fontSize: "75px" }} />
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
              disabled={isAddVideoPending}
              required
              value={formData.report_number}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        {/* End report number input */}

        {/* Start video file input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="ltr"
              fullWidth
              type="file"
              inputProps={{ accept: ".mp4" }}
              name="video_file"
              onChange={handleFileChange}
              required
              disabled={isAddVideoPending}
            />
          </Grid>
        </Grid>
        {/* End video file input */}

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isAddVideoPending}
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
        Videos
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr">
          <table>
            <thead>
              <tr>
                <th>Report Number</th>
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
                      href={report.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Video
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
