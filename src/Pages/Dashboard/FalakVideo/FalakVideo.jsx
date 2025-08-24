import style from "./FalakVideo.module.scss";
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
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
// API
import useGetAllFalakVideosApi from "../../../API/useGetAllFalakVideosApi.js";
import { useAddFalakVideoApi } from "../../../API/useAddFalakVideoApi";
import { useDeleteFalakVideoApi } from "../../../API/useDeleteFalakVideoApi";
// Toastify
import { toast } from "react-toastify";

export default function useGetAllFalakVideosApiVideo() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddVideoPending } = useAddFalakVideoApi();
  const { mutate: mutateDeleteVideo, isPending: isDeleteVideoPending } =
    useDeleteFalakVideoApi();
  const { data, isPending: isGetAllVideosPending } = useGetAllFalakVideosApi();

  const [formData, setFormData] = useState({
    video_file: null,
  });

  const [deletingId, setDeletingId] = useState(null);

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
    submitData.append("video_file", formData.video_file);

    mutate(submitData, {
      onSuccess: () => {
        toast.success("Video submitted successfully!");
        // Reset form after successful submission
        setFormData({
          video_file: null,
        });
        // Clear file input
        if (modelFormRef.current) {
          modelFormRef.current.reset();
        }
      },
    });
  };

  // Handle delete video
  const handleDeleteVideo = (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      setDeletingId(id);
      mutateDeleteVideo(id, {
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
        Falak Videos
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {/* Videos List */}
      <Grid container spacing={3}>
        {data?.data?.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Card>
              <CardMedia
                component="video"
                src={video.video_url}
                controls
                sx={{ height: 200 }}
              />
              <CardActions sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(video.created_at).toLocaleDateString("en-GB")}
                </Typography>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeleteVideo(video.id)}
                  disabled={isDeleteVideoPending && deletingId === video.id}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
