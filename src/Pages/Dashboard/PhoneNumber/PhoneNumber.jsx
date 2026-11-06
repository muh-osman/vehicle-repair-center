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
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
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
  const { mutate: postNumber, isPending: isPostNumberPending, isSuccess: isPostNumberSuccess } = useAddPhoneNumberApi();

  useEffect(() => {
    if (isPostNumberSuccess) {
      toast.success("Saved");
    }
  }, [isPostNumberSuccess]);

  const { mutate: deleteNumber, isPending: isDeleteNumberPending, isSuccess: isDeleteNumberSuccess } = useDeletePhoneNumberApi();

  useEffect(() => {
    if (isDeleteNumberSuccess) {
      toast.success("Deleted");
    }
  }, [isDeleteNumberSuccess]);

  // Handle add number
  const handleAddNumber = () => {
    const mobileInput = document.querySelector('input[name="accepted_phone_number"]');
    const specialCodeInput = document.querySelector('input[name="special_code"]');
    const number = mobileInput.value;
    const specialCode = specialCodeInput.value.trim();

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

    // special_code is optional (nullable)
    if (specialCode.length > 255) {
      toast.warn("Special code must not exceed 255 characters");
      return;
    }

    postNumber({
      accepted_phone_number: number,
      special_code: specialCode || null,
    });
  };

  useEffect(() => {
    if (isPostNumberSuccess) {
      const mobileInput = document.querySelector('input[name="accepted_phone_number"]');
      const specialCodeInput = document.querySelector('input[name="special_code"]');
      mobileInput.value = "";
      specialCodeInput.value = "";
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
            <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  fullWidth
                  label="Mobile"
                  type="tel"
                  name="accepted_phone_number"
                  required
                  placeholder="05xxxxxxxx"
                  disabled={isPending || isPostNumberPending || isDeleteNumberPending}
                  inputProps={{ minLength: 10, maxLength: 10 }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNumber()}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  fullWidth
                  label="Special Code"
                  name="special_code"
                  placeholder="Optional"
                  disabled={isPending || isPostNumberPending || isDeleteNumberPending}
                  inputProps={{ maxLength: 255 }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNumber()}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleAddNumber}
                  disabled={isPending || isPostNumberPending || isDeleteNumberPending}
                >
                  Save
                </Button>
              </Grid>
            </Grid>

            <Demo>
              <List dense={true} sx={{ border: "1px solid #0000002d", borderRadius: "4px" }}>
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
                            disabled={isPending || isPostNumberPending || isDeleteNumberPending}
                            onClick={() => handleDeleteNumber(item.id)}
                            sx={{
                              "&:hover": {
                                color: isPending || isPostNumberPending || isDeleteNumberPending ? "inherit" : "error.main", // Prevent hover effect when disabled
                              },
                              transition: "color 0.2s",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                        sx={{
                          "&:hover": {
                            bgcolor: isPending || isPostNumberPending || isDeleteNumberPending ? "transparent" : "action.hover", // Prevent hover effect when disabled
                          },
                          transition: "background-color 0.2s",
                          opacity: isPending || isPostNumberPending || isDeleteNumberPending ? 0.5 : 1, // Reduce opacity when disabled
                          pointerEvents: isPending || isPostNumberPending || isDeleteNumberPending ? "none" : "auto", // Prevent interaction when disabled
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: item.is_accept_terms ? "success.main" : "error.main",
                            }}
                          >
                            {item.is_accept_terms ? <CheckCircleIcon sx={{ width: "40px", height: "40px" }} /> : <CancelIcon sx={{ width: "40px", height: "40px" }} />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.accepted_phone_number}
                            </Typography>
                          }
                          secondaryTypographyProps={{ component: "div" }}
                          secondary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {`Number ${data?.data.length - index}`}
                              </Typography>

                              {item.special_code && <Chip icon={<VpnKeyIcon />} label={item.special_code} size="small" color="warning" variant="filled" sx={{ fontWeight: 600 }} />}
                            </Box>
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
