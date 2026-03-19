import style from "./BranchDiscount.module.scss";
import { useState, useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// LOGO
// import logo from "../../../Assets/Images/logo.png";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import InputAdornment from "@mui/material/InputAdornment";
import PercentIcon from "@mui/icons-material/Percent";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
// API
import useGetAllBranchDiscountApi from "../../../API/useGetAllBranchDiscountApi";
import { useAddBranchDiscountApi } from "../../../API/useAddBranchDiscountApi";
import { useDeleteBranchDiscountApi } from "../../../API/useDeleteBranchDiscountApi";
// Toastify
import { toast } from "react-toastify";
// Add this import at the top of your file
import QRCode from "qrcode";

const BRANCHES = ["القادسية", "الشفا", "الدمام", "جدة", "القصيم"];

export default function BranchDiscount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { mutate, isPending: isAddBranchDiscountPending } = useAddBranchDiscountApi();
  const { mutate: mutateDeleteBranchDiscount, isPending: isDeleteBranchDiscountPending } = useDeleteBranchDiscountApi();
  const { data, isPending: isGetAllBranchDiscountPending } = useGetAllBranchDiscountApi();

  const [formData, setFormData] = useState({
    branch_name: "",
    discount_percent: "",
    valid_until: "",
  });

  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For discount_percent, remove any decimal values
    if (name === "discount_percent") {
      const wholeNumber = value.includes(".") ? Math.floor(Number(value)) : value;
      setFormData((prev) => ({
        ...prev,
        [name]: wholeNumber,
      }));
      return;
    }

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

    if (!formData.branch_name) {
      toast.warn("Please select a branch");
      return;
    }

    // Prepare data for submission
    const submissionData = {
      branch_name: formData.branch_name,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      valid_until: formData.valid_until,
    };

    mutate(submissionData, {
      onSuccess: () => {
        toast.success("Added successfully!");
        setFormData({ branch_name: "", discount_percent: "", valid_until: "" });
      },
    });
  };

  // Handle delete client
  const handleDeleteClient = (clientId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setDeletingId(clientId); // Set the ID of the report being deleted
      mutateDeleteBranchDiscount(clientId, {
        onSuccess: () => {
          toast.success("Deleted successfully!");
        },
        onSettled: () => {
          setDeletingId(null); // Reset deleting ID when operation completes
        },
      });
    }
  };

  const downloadQrCode = async (branchName, discountPercent) => {
    try {
      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(`https://cashif.online/branch-discount-client/${encodeURIComponent(branchName)}`, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Create a canvas to combine QR code and text
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Load QR code image
      const qrCodeImg = new Image();
      qrCodeImg.src = qrCodeUrl;

      await new Promise((resolve) => {
        qrCodeImg.onload = resolve;
      });

      // Style configuration - now applying to entire image
      const style = {
        qrCodeWidth: qrCodeImg.width,
        qrCodeHeight: qrCodeImg.height,
        padding: 30, // Padding around entire image
        borderWidth: 3, // Border width
        borderRadius: 0, // Border radius for entire image
        borderColor: "#174545", // Border color
        backgroundColor: "#f5f5f5", // Background color for entire image
        shadowBlur: 15, // Shadow blur
        shadowColor: "rgba(63, 81, 181, 0.3)", // Shadow color
        qrCodeMargin: 20, // Space between QR code and text
      };

      // Calculate canvas dimensions (now including border in total dimensions)
      canvas.width = style.qrCodeWidth + style.padding * 2;
      canvas.height = style.qrCodeHeight + style.padding * 2; // Draw shadow first (applies to entire image)
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetY = 5;

      // Draw rounded rectangle background for entire image
      ctx.fillStyle = style.backgroundColor;
      roundRect(ctx, 0, 0, canvas.width, canvas.height, style.borderRadius);
      ctx.fill();

      // Reset shadow for other elements
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw border around entire image
      ctx.strokeStyle = style.borderColor;
      ctx.lineWidth = style.borderWidth;
      roundRect(ctx, 0, 0, canvas.width, canvas.height, style.borderRadius);
      ctx.stroke();

      // Draw QR code (centered horizontally)
      const qrCodeX = (canvas.width - style.qrCodeWidth) / 2;
      const qrCodeY = style.padding;
      ctx.drawImage(qrCodeImg, qrCodeX, qrCodeY, style.qrCodeWidth, style.qrCodeHeight);

      // Helper function to draw rounded rectangles
      function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }

      // Convert canvas to data URL and download
      const combinedUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = combinedUrl;
      link.download = `خصم-فرع-${branchName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  // Responsive table
  const [tableWidth, setTableWidth] = useState("auto");

  // Add this useEffect to handle responsive width
  useEffect(() => {
    const handleResize = () => {
      // Check if screen is small (e.g., less than 768px)
      if (window.innerWidth < 768) {
        setTableWidth(window.innerWidth - 63);
      } else {
        setTableWidth("auto");
      }
    };

    // Set initial width
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={style.container}>
      {isGetAllBranchDiscountPending && (
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
        <PercentIcon sx={{ fontSize: "75px" }} />
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
          {/* الفرع  */}
          <Grid item xs={12}>
            <FormControl fullWidth required sx={{ backgroundColor: "#fff" }}>
              <InputLabel>Branch</InputLabel>
              <Select name="branch_name" value={formData.branch_name} label="Branch" onChange={handleInputChange} disabled={isAddBranchDiscountPending}>
                {BRANCHES.map((branch) => (
                  <MenuItem dir="rtl" key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Add discount percent input */}
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="ltr"
              fullWidth
              label="Discount Percent"
              required
              placeholder="e.g. 10"
              type="number"
              name="discount_percent"
              disabled={isAddBranchDiscountPending}
              value={formData.discount_percent}
              onChange={handleInputChange}
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PercentIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Valid Until */}
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              fullWidth
              label="Valid Until"
              type="date"
              name="valid_until"
              required
              disabled={isAddBranchDiscountPending}
              value={formData.valid_until}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split("T")[0] }}
            />
          </Grid>
        </Grid>
        {/* End report number input */}

        {/* Start loading button for form 1 */}
        <LoadingButton type="submit" fullWidth variant="contained" disableRipple loading={isAddBranchDiscountPending} sx={{ mt: 3, mb: 2, transition: "0.1s" }}>
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
        Branch discount
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr" style={{ width: tableWidth === "auto" ? "auto" : `${tableWidth}px` }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#dddddd" }}>
                <th>Branch</th>
                <th>Discount</th>
                <th>Scans</th>
                <th>QR</th>
                <th>Valid Until</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((client) => (
                <tr
                  key={client.id}
                  style={{
                    backgroundColor: "#c5ebff",
                    color: "#000",
                  }}
                >
                  <td>{client.branch_name}</td>

                  <td>{client.discount_percent ? `${Math.floor(client.discount_percent)}%` : "N/A"}</td>

                  <td>{client.scan_count ?? 0}</td>

                  <td>
                    <button style={{ borderRadius: "4px" }} onClick={() => downloadQrCode(client.branch_name, Math.floor(client.discount_percent))}>
                      <QrCode2Icon />
                    </button>
                  </td>

                  <td>{new Date(client.valid_until).toLocaleDateString("en-GB")}</td>

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
