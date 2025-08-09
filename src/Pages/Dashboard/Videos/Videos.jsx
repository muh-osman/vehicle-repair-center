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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CircularProgress from "@mui/material/CircularProgress";

import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
// API
import useGetAllVideosApi from "../../../API/useGetAllVideosApi";
import { useAddVideoApi } from "../../../API/useAddVideoApi";
import { useDeleteVideoApi } from "../../../API/useDeleteVideoApi";
import { useEditVideoApi } from "../../../API/useEditVideoApi";
// Toastify
import { toast } from "react-toastify";

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddVideoPending } = useAddVideoApi();
  const { mutate: mutateDeleteVideo, isPending: isDeleteVideoPending } =
    useDeleteVideoApi();
  const { data, isPending: isGetAllVideosPending } = useGetAllVideosApi();

  const [formData, setFormData] = useState({
    report_number: "",
    video_files: [],
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
    const files = Array.from(e.target.files);

    // Limit to 3 files
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 videos");
      setFormData((prev) => ({
        ...prev,
        video_files: [],
      }));
      return;
    }

    // Check if all files are videos
    const allVideos = files.every((file) => file.type.startsWith("video/"));
    if (!allVideos) {
      toast.error("Please select only video files");
      setFormData((prev) => ({
        ...prev,
        video_files: [],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      video_files: files,
    }));
  };

  // Submit form
  const modelFormRef = useRef();

  // Handle file input change for main form

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const isValid = modelFormRef.current.reportValidity();
    if (!isValid) return;

    if (formData.video_files.length === 0) {
      toast.error("Please select at least one video file");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("report_number", formData.report_number);
    // Append each file
    formData.video_files.forEach((file, index) => {
      if (index === 0) {
        submitData.append("video_file", file); // First file
      } else if (index === 1) {
        submitData.append("video_file_2", file); // Second file
      } else if (index === 2) {
        submitData.append("video_file_3", file); // Third file
      }
    });

    mutate(submitData, {
      onSuccess: () => {
        toast.success("Videos submitted successfully!");
        // Reset form after successful submission
        setFormData({
          report_number: "",
          video_file: [],
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

  // Handle edit report
  const [uploadingVideoId, setUploadingVideoId] = useState(null); // Track which video is being uploaded
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const { mutate: mutateEditVideo, isPending: isEditVideoPending } =
    useEditVideoApi();

  // Handle file input change for AddCircleIcon
  const handleAddVideoClick = (reportId) => {
    setUploadingVideoId(reportId); // Set the ID of the report being added to
    fileInputRef.current.click(); // Trigger the file input
  };

  // Handle file selection for AddCircleIcon
  const handleSingleFileChange = (e) => {
    const file = e.target.files[0]; // Get only the first file
    if (!file) {
      setUploadingVideoId(null);
      return;
    }

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      setUploadingVideoId(null);
      return;
    }

    // Find the report to update
    const report = data.data.find((r) => r.id === uploadingVideoId);
    if (!report) {
      setUploadingVideoId(null);
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append("id", uploadingVideoId);
    submitData.append("report_number", report.report_number);

    // Determine which video slot to use (first empty slot)
    if (!report.video_url) {
      submitData.append("video_file", file);
    } else if (!report.video_url_2) {
      submitData.append("video_file_2", file);
    } else if (!report.video_url_3) {
      submitData.append("video_file_3", file);
    } else {
      toast.error("This report already has 3 videos");
      setUploadingVideoId(null);
      return;
    }

    mutateEditVideo(submitData, {
      onSuccess: () => {
        toast.success("Video added successfully!");
      },
      onError: () => {
        toast.error("Failed to add video");
      },
      onSettled: () => {
        setUploadingVideoId(null);
        fileInputRef.current.value = "";
      },
    });
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
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={isAddVideoPending}
              sx={{
                height: "56px",
                backgroundColor: "#fff",
                color: "rgba(0, 0, 0, 0.87)",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Upload Videos (Max 3)
              <VisuallyHiddenInput
                type="file"
                // accept=".mp4"
                accept="video/*" // Accept all video types
                multiple
                onChange={handleFileChange}
                required
              />
            </Button>

            {/* Show selected files */}
            {formData?.video_files?.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p>Selected files:</p>
                <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>
                  {formData.video_files.map((file, index) => (
                    <li key={index} style={{ fontSize: "0.875rem" }}>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formData?.video_files?.length >= 3 && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "green",
                  marginTop: "8px",
                }}
              >
                Maximum of 3 videos selected
              </p>
            )}
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

      {/* Hidden file input for AddCircleIcon */}
      <VisuallyHiddenInput
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleSingleFileChange}
      />

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
                <th>Video</th>
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

                  <td style={{ whiteSpace: "nowrap" }}>
                    <a
                      href={report.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      1
                    </a>{" "}
                    {report?.video_url_2 && (
                      <a
                        href={report.video_url_2}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        2
                      </a>
                    )}{" "}
                    {report?.video_url_3 && (
                      <a
                        href={report.video_url_3}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        3
                      </a>
                    )}
                  </td>

                  <td>
                    {/* <LoadingButton
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
                    </LoadingButton> */}

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleAddVideoClick(report.id)}
                        disabled={
                          isDeleteVideoPending ||
                          isEditVideoPending ||
                          report.video_file_path_3 ||
                          isAddVideoPending
                        }
                      >
                        {uploadingVideoId === report.id &&
                        isEditVideoPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          <AddCircleIcon />
                        )}
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={
                          (deletingId !== null && deletingId !== report.id) ||
                          isDeleteVideoPending ||
                          isEditVideoPending ||
                          isAddVideoPending
                        }
                      >
                        {deletingId === report.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </div>
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
