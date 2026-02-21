import style from "./Videos.module.scss";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
// API
import useGetAllVideosApi from "../../../API/useGetAllVideosApi";
import { useAddVideoApi } from "../../../API/useAddVideoApi";
import { useDeleteVideoApi } from "../../../API/useDeleteVideoApi";
import { useEditVideoApi } from "../../../API/useEditVideoApi";
// Toastify
import { toast } from "react-toastify";
// Cookies
import { useCookies } from "react-cookie";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Videos() {
  // Cookie
  const [cookies, setCookie] = useCookies(["role"]);
  //
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddVideoPending } = useAddVideoApi();
  const { mutate: mutateDeleteVideo, isPending: isDeleteVideoPending } = useDeleteVideoApi();
  const { data, isPending: isGetAllVideosPending } = useGetAllVideosApi();

  const [reportNumber, setReportNumber] = useState("");

  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Submit form
  const modelFormRef = useRef();

  // Handle file input change for main form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const isValid = modelFormRef.current.reportValidity();
    if (!isValid) return;

    mutate(
      { report_number: reportNumber },

      {
        onSuccess: () => {
          toast.success("Created successfully!");
          // Reset form after successful submission
          setReportNumber("");

          // Clear file input
          if (modelFormRef.current) {
            modelFormRef.current.reset();
          }
        },
      }
    );
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

  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: mutateEditVideo, isPending: isEditVideoPending } = useEditVideoApi(setUploadProgress);

  //
  const [openModal, setOpenModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [videosFiles, setVideosFiles] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [videoTypes, setVideoTypes] = useState([]);

  const handleAddVideoClick = (reportId) => {
    setSelectedReportId(reportId);
    setUploadProgress(0);
    setOpenModal(true);
  };

  const handleVideoFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setVideosFiles(files);

    // Prepare matching inputs
    setEmployeeNames(Array(files.length).fill(""));
    setVideoTypes(Array(files.length).fill(""));
  };

  const handleEmployeeChange = (index, value) => {
    const updated = [...employeeNames];
    updated[index] = value;
    setEmployeeNames(updated);
  };

  const handleVideoTypeChange = (index, value) => {
    const updated = [...videoTypes];
    updated[index] = value;
    setVideoTypes(updated);
  };

  const handleModalSubmit = () => {
    // No videos selected
    if (videosFiles.length === 0) {
      toast.error("Please select at least one video");
      return;
    }

    // Check all video types filled
    for (let i = 0; i < videoTypes.length; i++) {
      if (!videoTypes[i]) {
        toast.error(`Please select video type for video ${i + 1}`);
        return;
      }
    }

    // Check all employee names filled
    for (let i = 0; i < employeeNames.length; i++) {
      if (!employeeNames[i].trim()) {
        toast.error(`Please enter employee name for video ${i + 1}`);
        return;
      }
    }

    // Build FormData
    const formData = new FormData();

    videosFiles.forEach((file) => formData.append("videos[]", file));
    videoTypes.forEach((type) => formData.append("video_type[]", type));
    employeeNames.forEach((name) => formData.append("employee_name[]", name));

    mutateEditVideo(
      { id: selectedReportId, data: formData },
      {
        onSuccess: () => {
          toast.success("Videos uploaded successfully!");
          setOpenModal(false);
          resetModal();
          setUploadProgress(0);
        },
        onError: () => toast.error("Upload failed"),
      }
    );
  };

  const resetModal = () => {
    setVideosFiles([]);
    setEmployeeNames([]);
    setVideoTypes([]);
    setSelectedReportId(null);
  };

  return (
    <div className={style.container}>
      {isGetAllVideosPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <Link to={cookies.role === 255 ? "/dashboard/videos-analytics" : "/dashboard/videos"}>
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
      </Link>
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
        <Grid container spacing={3}>
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
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
            />
          </Grid>
        </Grid>
        {/* End report number input */}

        {/* Start loading button for form 1 */}
        <LoadingButton type="submit" fullWidth variant="contained" disableRipple loading={isAddVideoPending} sx={{ mt: 3, mb: 2, transition: "0.1s" }}>
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
                <th>Card Number</th>
                <th>Date</th>
                <th>Video</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((report) => (
                <tr key={report.id}>
                  <td>{report.report_number}</td>

                  <td>{new Date(report.created_at).toLocaleDateString("en-GB")}</td>

                  <td style={{ whiteSpace: "nowrap" }}>
                    {report.videos?.map((video, index) => (
                      <Tooltip key={video.id || index} title={`Type: ${video.video_type} - Staff: ${video.employee_name || "No name"}`} arrow placement="top">
                        <a href={video.video_url} target="_blank" rel="noopener noreferrer" style={{ marginRight: "8px", textDecoration: "none" }}>
                          {index + 1}
                        </a>
                      </Tooltip>
                    ))}
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "space-evenly",
                      }}
                    >
                      {/* <IconButton
                        color="primary"
                        onClick={() => handleAddVideoClick(report.id)}
                        disabled={isDeleteVideoPending || isEditVideoPending || Boolean(report.video_file_path_3) || isAddVideoPending}
                      >
                        {uploadingVideoId === report.id && isEditVideoPending ? <CircularProgress size={24} /> : <AddCircleIcon />}
                      </IconButton> */}

                      <IconButton color="primary" onClick={() => handleAddVideoClick(report.id)}>
                        <AddCircleIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={(deletingId !== null && deletingId !== report.id) || isDeleteVideoPending || isEditVideoPending || isAddVideoPending}
                      >
                        {deletingId === report.id ? <CircularProgress size={24} /> : <DeleteIcon />}
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 375,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Add Videos
          </Typography>

          <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
            Select Videos
            <VisuallyHiddenInput type="file" multiple accept="video/*" onChange={handleVideoFilesChange} />
          </Button>

          {videosFiles.map((file, index) => (
            <Box key={index} mt={2}>
              <Typography variant="body2">{file.name}</Typography>

              <TextField
                dir="rtl"
                fullWidth
                select
                label="نوع الفيديو"
                value={videoTypes[index] || ""}
                onChange={(e) => handleVideoTypeChange(index, e.target.value)}
                sx={{ mt: 1 }}
              >
                <MenuItem dir="rtl" value="شرح التقرير">
                  شرح التقرير
                </MenuItem>
                <MenuItem dir="rtl" value="فيديو للسيارة">
                  فيديو للسيارة
                </MenuItem>
              </TextField>

              <TextField dir="rtl" fullWidth label="اسم الموظف" value={employeeNames[index] || ""} onChange={(e) => handleEmployeeChange(index, e.target.value)} sx={{ mt: 1 }} />
            </Box>
          ))}

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>

            <LoadingButton variant="contained" loading={isEditVideoPending} onClick={handleModalSubmit} disabled={videosFiles.length === 0}>
              Upload
            </LoadingButton>
          </Box>

          {isEditVideoPending && (
            <Box mt={2}>
              <Typography variant="body2">Uploading... {uploadProgress}%</Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
}
