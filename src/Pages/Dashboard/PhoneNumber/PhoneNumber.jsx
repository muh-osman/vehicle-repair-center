import style from "./PhoneNumber.module.scss";
import { useEffect } from "react";
// MUI
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import Avatar from "@mui/material/Avatar";
import { LinearProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import PhoneIcon from "@mui/icons-material/Phone";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
// Toastify
import { toast } from "react-toastify";
// Api
import useGetPhoneNumberApi from "../../../API/useGetPhoneNumberApi";
import { useAddPhoneNumberApi } from "../../../API/useAddPhoneNumberApi";
import { useDeletePhoneNumberApi } from "../../../API/useDeletePhoneNumberApi";

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

export default function PhoneNumber() {
  const { data, isPending } = useGetPhoneNumberApi();
  const {
    mutate: postNumber,
    isPending: isPostNumberPending,
    isSuccess: isPostNumberSuccess,
  } = useAddPhoneNumberApi();

  useEffect(() => {
    if (isPostNumberSuccess) {
      toast.success("Saved");
    }
  }, [isPostNumberSuccess]);

  const {
    mutate: deleteNumber,
    isPending: isDeleteNumberPending,
    isSuccess: isDeleteNumberSuccess,
  } = useDeletePhoneNumberApi();

  useEffect(() => {
    if (isDeleteNumberSuccess) {
      toast.success("Deleted");
    }
  }, [isDeleteNumberSuccess]);

  // Handle add number
  const handleAddNumber = () => {
    const mobileInput = document.querySelector(
      'input[name="accepted_phone_number"]'
    );
    const number = mobileInput.value;

    if (!number) {
      toast.warn("Please enter a mobile number");
      return;
    }

    // Check if number length 10
    if (number.length !== 10) {
      toast.warn("Mobile number must be 10 digits long");
      return;
    }

    // Regular expression to check for letters
    const hasLetters = /[a-zA-Z]/;
    if (hasLetters.test(number)) {
      toast.warn("Mobile number must not contain letters");
      return;
    }

    postNumber({ accepted_phone_number: number });
  };

  useEffect(() => {
    if (isPostNumberSuccess) {
      const mobileInput = document.querySelector(
        'input[name="accepted_phone_number"]'
      );
      mobileInput.value = "";
    }
  }, [isPostNumberSuccess]);

  // Handle delete number
  const handleDeleteNumber = (id) => {
    deleteNumber(id);
  };

  return (
    <div className={style.container}>
      {(isPending || isPostNumberPending || isDeleteNumberPending) && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <Box sx={{ flexGrow: 1 }}>
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
          <GroupAddIcon sx={{ fontSize: "75px" }} />
        </Avatar>

        <Grid container>
          <Grid item xs={12} md={6} sx={{ margin: "auto" }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff", mt: 3, mb: 2 }}
                fullWidth
                label="Mobile"
                type="tel"
                name="accepted_phone_number"
                required
                placeholder="05xxxxxxxx"
                disabled={
                  isPending || isPostNumberPending || isDeleteNumberPending
                }
                inputProps={{ minLength: 10, maxLength: 10 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleAddNumber}
                        edge="end"
                        disabled={
                          isPending ||
                          isPostNumberPending ||
                          isDeleteNumberPending
                        }
                      >
                        <DownloadIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Demo>
              <List
                dense={true}
                sx={{ border: "1px solid #0000002d", borderRadius: "4px" }}
              >
                {data?.data.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No phone numbers added yet
                    </Typography>
                  </Box>
                ) : (
                  data?.data
                    ?.slice()
                    .reverse()
                    .map((item, index) => (
                      <ListItem
                        key={item.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            disabled={
                              isPending ||
                              isPostNumberPending ||
                              isDeleteNumberPending
                            }
                            onClick={() => handleDeleteNumber(item.id)}
                            sx={{
                              "&:hover": {
                                color:
                                  isPending ||
                                  isPostNumberPending ||
                                  isDeleteNumberPending
                                    ? "inherit"
                                    : "error.main", // Prevent hover effect when disabled
                              },
                              transition: "color 0.2s",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                        sx={{
                          "&:hover": {
                            bgcolor:
                              isPending ||
                              isPostNumberPending ||
                              isDeleteNumberPending
                                ? "transparent"
                                : "action.hover", // Prevent hover effect when disabled
                          },
                          transition: "background-color 0.2s",
                          opacity:
                            isPending ||
                            isPostNumberPending ||
                            isDeleteNumberPending
                              ? 0.5
                              : 1, // Reduce opacity when disabled
                          pointerEvents:
                            isPending ||
                            isPostNumberPending ||
                            isDeleteNumberPending
                              ? "none"
                              : "auto", // Prevent interaction when disabled
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <PhoneIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.accepted_phone_number}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {`Number ${data?.data.length - index}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                )}
              </List>
            </Demo>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
