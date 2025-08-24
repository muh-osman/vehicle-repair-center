import style from "./FalakMedia.module.scss";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { useNavigate } from "react-router-dom";

export default function FalakMedia() {
  const navigate = useNavigate();

  const handleAddImage = () => {
    console.log("Navigating to image upload");
    navigate("/dashboard/falak-post");
  };

  const handleAddVideo = () => {
    console.log("Navigating to video upload");
    navigate("/dashboard/falak-video");
  };

  return (
    <div className={style.container}>
      <Stack
        direction="row"
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            color="primary"
            aria-label="add image"
            onClick={handleAddImage}
            size="large"
            sx={{ mb: 1 }}
          >
            <AddPhotoAlternateIcon fontSize="large" />
          </IconButton>
          <Typography variant="caption" component="div">
            Add Image
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            color="primary"
            aria-label="add video"
            onClick={handleAddVideo}
            size="large"
            sx={{ mb: 1 }}
          >
            <VideoLibraryIcon fontSize="large" />
          </IconButton>
          <Typography variant="caption" component="div">
            Add Video
          </Typography>
        </Box>
      </Stack>
    </div>
  );
}
