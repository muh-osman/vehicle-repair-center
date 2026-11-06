import style from "./Videos.module.scss";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
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
import Pagination from "@mui/material/Pagination";
// API
import useGetAllVideosApi from "../../../API/useGetAllVideosApi";
import { useAddVideoApi } from "../../../API/useAddVideoApi";
import { useDeleteVideoApi } from "../../../API/useDeleteVideoApi";
import { useEditVideoApiChunked } from "../../../API/useEditVideoApiChunked";
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

const ROWS_PER_PAGE = 10;

// Memoized row so a row only re-renders when its own report / relevant state changes,
// not whenever the parent re-renders (e.g. on every keystroke in the top form).
const VideoReportRow = memo(function VideoReportRow({ report, role, isRowDeleting, isDeleteDisabled, onAddVideoClick, onDeleteReport, isAddVideoPending, isEditVideoPending }) {
  return (
    <tr>
      <td>{report.report_number}</td>

      <td>{report.branch || "-"}</td>

      <td>{new Date(report.created_at).toLocaleDateString("en-GB")}</td>

      <td style={{ whiteSpace: "nowrap", display: "table-cell", flexDirection: "column" }}>
        {report.videos?.map((video, index) => (
          <Tooltip key={video.id || index} title={`Type: ${video.video_type} - Staff: ${video.employee_name || "No name"}`} arrow placement="top">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <a href={video.video_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                {index + 1}
              </a>
            </div>
          </Tooltip>
        ))}
      </td>

      <td>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            justifyContent: "space-evenly",
          }}
        >
          <IconButton
            style={{ width: "fit-content", margin: "auto" }}
            disabled={role === 50}
            color="primary"
            onClick={() => onAddVideoClick(report.id)}
            disabled={isDeleteDisabled || isRowDeleting || isAddVideoPending || isEditVideoPending}
          >
            <AddCircleIcon />
          </IconButton>

          <IconButton style={{ width: "fit-content", margin: "auto" }} color="error" onClick={() => onDeleteReport(report.id)} disabled={isDeleteDisabled || role === 50}>
            {isRowDeleting ? <CircularProgress size={24} /> : <DeleteIcon />}
          </IconButton>
        </div>
      </td>
    </tr>
  );
});

export default function Videos() {
  // Cookie
  const [cookies] = useCookies(["role"]);
  //
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add direction: ltr to body when this page is open
  useEffect(() => {
    document.body.style.direction = "ltr";
    return () => {
      document.body.style.direction = "";
    };
  }, []);

  const { mutate, isPending: isAddVideoPending } = useAddVideoApi();
  const { mutate: mutateDeleteVideo, isPending: isDeleteVideoPending } = useDeleteVideoApi();
  const { data, isPending: isGetAllVideosPending } = useGetAllVideosApi();

  const [reportNumber, setReportNumber] = useState("");
  const [branch, setBranch] = useState("");

  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Pagination state
  const [page, setPage] = useState(1);

  // Submit form
  const modelFormRef = useRef();

  // Handle file input change for main form
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Validate form
      const isValid = modelFormRef.current.reportValidity();
      if (!isValid) return;

      mutate(
        {
          report_number: reportNumber,
          branch: branch,
        },
        {
          onSuccess: () => {
            toast.success("Created successfully!");
            // Reset form after successful submission
            setReportNumber("");
            setBranch("");

            // Clear file input
            if (modelFormRef.current) {
              modelFormRef.current.reset();
            }
          },
        }
      );
    },
    [mutate, reportNumber, branch]
  );

  // Handle delete report
  const handleDeleteReport = useCallback(
    (reportId) => {
      if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع الفيديوهات المرتبطة بهذا التقرير؟")) {
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
    },
    [mutateDeleteVideo]
  );

  const [uploadProgress, setUploadProgress] = useState(0);
  // const { mutate: mutateEditVideo, isPending: isEditVideoPending, reset: resetEditVideoMutation } = useEditVideoApi(setUploadProgress);
  const { mutate: mutateEditVideo, isPending: isEditVideoPending, reset: resetEditVideoMutation } = useEditVideoApiChunked(setUploadProgress);

  // Holds the AbortController for the in-flight upload so we can cancel it
  // if the user closes the modal / clicks Cancel while it's uploading.
  const abortControllerRef = useRef(null);

  //
  const [openModal, setOpenModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [videosFiles, setVideosFiles] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [videoTypes, setVideoTypes] = useState([]);

  const handleAddVideoClick = useCallback((reportId) => {
    setSelectedReportId(reportId);
    setUploadProgress(0);
    setOpenModal(true);
  }, []);

  const handleVideoFilesChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setVideosFiles(files);

    // Prepare matching inputs
    setEmployeeNames(Array(files.length).fill(""));
    setVideoTypes(Array(files.length).fill(""));
  }, []);

  const handleEmployeeChange = useCallback((index, value) => {
    setEmployeeNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleVideoTypeChange = useCallback((index, value) => {
    setVideoTypes((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const resetModal = useCallback(() => {
    setVideosFiles([]);
    setEmployeeNames([]);
    setVideoTypes([]);
    setSelectedReportId(null);
  }, []);

  const handleModalSubmit = useCallback(() => {
    if (videosFiles.length === 0) {
      toast.error("Please select at least one video");
      return;
    }
    for (let i = 0; i < videoTypes.length; i++) {
      if (!videoTypes[i]) {
        toast.error(`Please select video type for video ${i + 1}`);
        return;
      }
    }
    for (let i = 0; i < employeeNames.length; i++) {
      if (!employeeNames[i].trim()) {
        toast.error(`Please enter employee name for video ${i + 1}`);
        return;
      }
    }

    abortControllerRef.current = new AbortController();

    mutateEditVideo(
      {
        id: selectedReportId,
        videosFiles,
        videoTypes,
        employeeNames,
        signal: abortControllerRef.current.signal,
      },
      {
        onSuccess: () => {
          toast.success("Videos uploaded successfully!");
          setOpenModal(false);
          resetModal();
          setUploadProgress(0);
        },
        onError: (err) => {
          const wasCancelled = err?.name === "CanceledError" || err?.code === "ERR_CANCELED" || err?.name === "AbortError";
          if (!wasCancelled) toast.error("Upload failed");
        },
      }
    );
  }, [videosFiles, videoTypes, employeeNames, mutateEditVideo, selectedReportId, resetModal]);

  // Reset to page 1 whenever the underlying dataset changes (e.g. after add/delete)
  // so we never get stuck on a page that no longer exists.
  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));
  }, [data]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * ROWS_PER_PAGE;
    return data.slice(start, start + ROWS_PER_PAGE);
  }, [data, page]);

  const handlePageChange = useCallback((_event, value) => {
    setPage(value);
    // Scroll the table back into view when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Closing the modal (via backdrop click, Esc, or the Cancel button) now:
  // 1. Aborts the in-flight upload request if one is running.
  // 2. Force-resets the mutation's pending state instead of waiting for
  //    the aborted request to settle on its own.
  // 3. Clears the modal's local state (files, names, types, progress).
  const handleCloseModal = useCallback(() => {
    if (isEditVideoPending) {
      abortControllerRef.current?.abort();
      resetEditVideoMutation();
    }
    setOpenModal(false);
    resetModal();
    setUploadProgress(0);
  }, [isEditVideoPending, resetEditVideoMutation, resetModal]);

  return (
    <div className={style.container}>
      {isGetAllVideosPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      {/* <Link to={cookies.role === 255 ? "/dashboard/videos-analytics" : "/dashboard/videos"}> */}
      <Avatar
        component={Link}
        to={cookies.role === 255 ? "/dashboard/videos-analytics" : "/dashboard/videos"}
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
      {/* </Link> */}
      {/* Start Form */}
      {cookies.role !== 50 && (
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
                disabled={isAddVideoPending || isEditVideoPending}
                required
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
              />
            </Grid>

            {/* Branch Select Input */}
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl" // Set to rtl for Arabic text
                fullWidth
                select
                label="الفرع"
                name="branch"
                required
                disabled={isAddVideoPending || isEditVideoPending}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <MenuItem dir="rtl" value="القادسية">
                  القادسية
                </MenuItem>
                <MenuItem dir="rtl" value="الشفا">
                  الشفا
                </MenuItem>
                <MenuItem dir="rtl" value="الدمام">
                  الدمام
                </MenuItem>
                <MenuItem dir="rtl" value="جدة">
                  جدة
                </MenuItem>
                <MenuItem dir="rtl" value="القصيم">
                  القصيم
                </MenuItem>
                <MenuItem dir="rtl" value="خميس مشيط">
                  خميس مشيط
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {/* End report number input */}

          {/* Start loading button for form 1 */}
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            disableRipple
            loading={isAddVideoPending}
            sx={{ mt: 3, mb: 2, transition: "0.1s" }}
            disabled={isEditVideoPending}
          >
            Add
          </LoadingButton>
          {/* End loading button for form 1 */}
        </Box>
      )}
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
        <>
          <div className={style.table_container} dir="ltr">
            <table>
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Video</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((report) => (
                  <VideoReportRow
                    key={report.id}
                    report={report}
                    role={cookies.role}
                    isRowDeleting={deletingId === report.id}
                    isDeleteDisabled={(deletingId !== null && deletingId !== report.id) || isDeleteVideoPending || isEditVideoPending || isAddVideoPending}
                    onAddVideoClick={handleAddVideoClick}
                    onDeleteReport={handleDeleteReport}
                    isAddVideoPending={isAddVideoPending}
                    isEditVideoPending={isEditVideoPending}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
            </Box>
          )}
        </>
      )}

      <Modal dir="ltr" open={openModal}>
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

          <Button disabled={isEditVideoPending} dir="ltr" component="label" variant="contained" startIcon={<CloudUploadIcon />}>
            Select Videos
            <VisuallyHiddenInput type="file" multiple accept="video/*" onChange={handleVideoFilesChange} />
          </Button>

          {videosFiles.map((file, index) => (
            <Box key={index} mt={2}>
              <Typography sx={{ marginBottom: "9px" }} variant="body2">
                {file.name}
              </Typography>

              <TextField
                dir="rtl"
                fullWidth
                select
                label="نوع الفيديو"
                value={videoTypes[index] || ""}
                onChange={(e) => handleVideoTypeChange(index, e.target.value)}
                sx={{ mt: 1 }}
                disabled={isEditVideoPending}
              >
                <MenuItem dir="rtl" value="شرح التقرير">
                  شرح التقرير
                </MenuItem>
                <MenuItem dir="rtl" value="فيديو للسيارة">
                  فيديو للسيارة
                </MenuItem>
              </TextField>

              <TextField
                dir="rtl"
                fullWidth
                label="اسم الموظف"
                value={employeeNames[index] || ""}
                onChange={(e) => handleEmployeeChange(index, e.target.value)}
                sx={{ mt: 2 }}
                disabled={isEditVideoPending}
              />
            </Box>
          ))}

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={handleCloseModal}>Cancel</Button>

            <LoadingButton variant="contained" loading={isEditVideoPending} onClick={handleModalSubmit} disabled={videosFiles.length === 0}>
              Upload
            </LoadingButton>
          </Box>

          {isEditVideoPending && (
            <Box mt={2}>
              <Typography sx={{ marginBottom: "9px" }} variant="body2">
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
}
