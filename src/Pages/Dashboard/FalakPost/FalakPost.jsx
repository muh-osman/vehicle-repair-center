import style from "./FalakPost.module.scss";
//
import * as React from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
// Api
import useGetAllMarketingPostsApi from "../../../API/useGetAllMarketingPostsApi";
import { usePostMarketingPostsApi } from "../../../API/usePostMarketingPostsApi";
import { useDeleteMarketingPostsApi } from "../../../API/useDeleteMarketingPostsApi";

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

export default function FalakPost() {
  const {
    data: AllPosts,
    isPending: isGetAllPostsPending,
    isSuccess: isGetAllPostsSuccess,
    fetchStatus: fetchAllPostsStatus,
  } = useGetAllMarketingPostsApi();

  const {
    mutate: mutatePosts,
    isPending: isMutatePostsPending,
    isSuccess: isMutatePostsSuccess,
  } = usePostMarketingPostsApi();

  const {
    mutate: mutateDeletePosts,
    isPending: isDeletePostsPending,
    isSuccess: isDeletePostsSuccess,
    variables: deleteVariables, // This will contain the ID being deleted
  } = useDeleteMarketingPostsApi();

  //
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const handleUploadImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const handeleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const submitPost = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", uploadedImage); // Make sure uploadedImage is a File object

    mutatePosts(formData);
  };

  //
  React.useEffect(() => {
    if (isMutatePostsSuccess) {
      setUploadedImage(null);
      setTitle("");
    }
  }, [isMutatePostsSuccess]);

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleDeletePost = (id) => {
    mutateDeletePosts(id);
  };

  // Clean up the object URL when the component unmounts or when the image changes
  React.useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  return (
    <div className={style.container}>
      <div className={style.upload_box}>
        {uploadedImage && (
          <div className={style.img_box}>
            <img src={URL.createObjectURL(uploadedImage)} alt="post preview" />
            <IconButton
              aria-label="remove image"
              onClick={handleRemoveImage}
              disabled={isMutatePostsPending}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        )}
        <TextField
          autoFocus
          sx={{ backgroundColor: "#ffff" }}
          dir="rtl"
          label="Post"
          multiline
          rows={5}
          onChange={handeleTitleChange}
          value={title}
          disabled={isMutatePostsPending}
          required
        />

        {!uploadedImage && (
          <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
            Upload image
            <VisuallyHiddenInput type="file" onChange={handleUploadImage} />
          </Button>
        )}

        {uploadedImage && (
          <LoadingButton
            fullWidth
            variant="contained"
            disableRipple
            onClick={submitPost}
            loading={isMutatePostsPending}
          >
            Post
          </LoadingButton>
        )}
      </div>

      <p
        style={{
          marginTop: "64px",
          width: "fit-content",
          padding: "0 6px",
          borderRadius: "3px",
        }}
      >
        Marketing posts
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {AllPosts && (
        <div className={style.posts_box}>
          {AllPosts.data.map(({ id, title, image_url }) => (
            <div key={id} className={style.posts_card}>
              <div className={style.img_box}>
                <img src={image_url} alt="post preview" />
              </div>

              <TextField
                sx={{ backgroundColor: "#ffff" }}
                dir="rtl"
                multiline
                rows={5}
                defaultValue={title}
                disabled={true}
              />

              <LoadingButton
                fullWidth
                variant="contained"
                disableRipple
                loading={isDeletePostsPending && deleteVariables === id} // Only show loading for this specific post
                color="error"
                onClick={() => handleDeletePost(id)}
              >
                Delete
              </LoadingButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
