import style from "./FreeOrder.module.scss";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import QrCode2Icon from "@mui/icons-material/QrCode2";
// API
import useGetAllFreeOrdersApi from "../../../API/useGetAllFreeOrdersApi";
import { useAddFreeOrdersApi } from "../../../API/useAddFreeOrdersApi";
import { useDeleteFreeOrderApi } from "../../../API/useDeleteFreeOrderApi";
// Toastify
import { toast } from "react-toastify";
// Add this import at the top of your file
import QRCode from "qrcode";

export default function FreeOrder() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddFreeOrdersPending } = useAddFreeOrdersApi();
  const { mutate: mutateDeleteFreeOrder, isPending: isDeleteFreeOrderPending } =
    useDeleteFreeOrderApi();
  const { data, isPending: isGetAllFreeOrdersPending } =
    useGetAllFreeOrdersApi();

  const [formData, setFormData] = useState({
    phone_number: "",
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

  // Submit form
  const modelFormRef = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const isValid = modelFormRef.current.reportValidity();
    if (!isValid) return;

    if (!formData.phone_number.startsWith("0")) {
      toast.warn("Phone number must start with 0");
      return;
    }

    mutate(formData, {
      onSuccess: () => {
        toast.success("Added successfully!");
        // Reset form after successful submission
        setFormData({
          phone_number: "",
        });
      },
    });
  };

  // Handle delete client
  const handleDeleteClient = (clientId) => {
    if (window.confirm("Are you sure you want to delete this number?")) {
      setDeletingId(clientId); // Set the ID of the report being deleted
      mutateDeleteFreeOrder(clientId, {
        onSuccess: () => {
          toast.success("Deleted successfully!");
        },
        onSettled: () => {
          setDeletingId(null); // Reset deleting ID when operation completes
        },
      });
    }
  };

  const downloadQrCode = async (phoneNumber) => {
    try {
      const url = await QRCode.toDataURL(`free-${phoneNumber}`, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const link = document.createElement("a");
      link.href = url;
      link.download = `QRCode-${phoneNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  return (
    <div className={style.container}>
      {isGetAllFreeOrdersPending && (
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
        <LoyaltyIcon sx={{ fontSize: "75px" }} />
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
        {/* Start phone number input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="ltr"
              fullWidth
              label="Phone number"
              placeholder="05xxxxxxxx"
              type="tel"
              name="phone_number"
              disabled={isAddFreeOrdersPending}
              required
              value={formData.phone_number}
              onChange={handleInputChange}
              inputProps={{
                minLength: 10,
                maxLength: 10,
              }}
            />
          </Grid>
        </Grid>
        {/* End report number input */}

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isAddFreeOrdersPending}
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
        Free orders
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr">
          <table>
            <thead>
              <tr style={{ backgroundColor: "#dddddd" }}>
                <th>Phone Number</th>
                <th>QR</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((client) => (
                <tr
                  key={client.id}
                  style={{
                    backgroundColor: client.is_scanned ? "#c5ebff" : "#d32f2f",
                    color: client.is_scanned ? "#000" : "#fff",
                  }}
                >
                  <td>{client.phone_number}</td>

                  <td>
                    <button onClick={() => downloadQrCode(client.phone_number)}>
                      <QrCode2Icon />
                    </button>
                  </td>

                  <td>
                    {new Date(client.created_at).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    <LoadingButton
                      className={style.del_btn}
                      type="button"
                      fullWidth
                      variant="contained"
                      disableRipple
                      color="error"
                      onClick={() => handleDeleteClient(client.id)}
                      loading={deletingId === client.id} // Only show loading for this specific button
                      disabled={deletingId !== null && deletingId !== client.id} // Disable other buttons while one is loading
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
