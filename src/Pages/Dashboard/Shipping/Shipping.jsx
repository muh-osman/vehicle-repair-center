import style from "./Shipping.module.scss";
import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// API
import useGetAllShippingPaymensApi from "../../../API/useGetAllShippingPaymensApi";
import useEditIsShippedApi from "../../../API/useEditIsShippedApi";
import useEditAccountantStatusApi from "../../../API/useEditAccountantStatusApi";
import useEditNoteApi from "../../../API/useEditNoteApi"; // Add this import
// Cookies
import { useCookies } from "react-cookie";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit"; // Add Edit icon
import NoteIcon from "@mui/icons-material/Note"; // Add Note icon
// import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Tooltip from "@mui/material/Tooltip"; // Add for tooltips
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch"; // Add Switch import
// import FormControlLabel from "@mui/material/FormControlLabel";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import Snackbar from "@mui/material/Snackbar"; // For notifications
// import Alert from "@mui/material/Alert"; // For notifications
// Add these MUI components for the modal
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function Shipping() {
  // Cookies
  const [cookies, setCookie, removeCookie] = useCookies(["role"]);
  // const navigate = useNavigate(); // Initialize navigate

  // Add state for note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [noteField, setNoteField] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  //
  const { data, isPending: isGetAllShippingPaymensPending, isSuccess, fetchStatus: fetchAllShippingPaymensStatus } = useGetAllShippingPaymensApi();
  const markAsAccountedMutation = useEditAccountantStatusApi();
  const updateNoteMutation = useEditNoteApi();
  //
  const markAsShippedMutation = useEditIsShippedApi();
  // Transform API data to match DataGrid rows
  const rows =
    data?.data?.map((item, index, array) => ({
      id: item.id, // DataGrid requires an id field
      index: array.length - index, // Row number starting from 1
      date: item.created_at, // Will be formatted in renderCell
      time: item.created_at, // Will be formatted in renderCell
      reportNumber: item.reportNumber,
      name: item.name,
      phone: item.phoneNumber,
      branch: item.from, // Assuming 'from' represents the branch
      to: item.to,
      price: parseFloat(item.price) || 0, // Convert string to number
      model: item.model,
      shippingType: item.shippingType,
      plateNumber: item.plateNumber,
      status: item.status,
      phoneNumber: item.phoneNumber,
      payment_id: item.payment_id,
      isShipped: item.isShipped || false,
      accountant_status: item.accountant_status || false,
      note: item.note || "",
    })) || [];

  // Handle mark as shipped
  // Handle checkbox change for shipped status
  const handleShippedChange = async (id, currentIsShipped) => {
    // Get the new state (opposite of current)
    const newShippedState = !currentIsShipped;

    // Show confirmation dialog
    const action = newShippedState ? "mark as shipped" : "mark as not shipped";
    const isConfirmed = window.confirm(`Are you sure you want to ${action}?`);

    if (!isConfirmed) {
      return; // User cancelled
    }

    try {
      // Only need to call the API if we're marking as shipped
      // If your API handles both shipped/unshipped, you might need to adjust this
      if (newShippedState) {
        await markAsShippedMutation.mutateAsync(id);
      } else {
        // If you have an API for unshipping, call it here
        // For now, we'll just call the same API - adjust based on your backend
        await markAsShippedMutation.mutateAsync(id);
      }
    } catch (error) {
      console.log(error);
      // You might want to show an error message to the user here
    }
  };

  // Handle mark as accounted
  const handleAccountedChange = async (id, currentAccountantStatus) => {
    const newAccountedState = !currentAccountantStatus;
    const action = newAccountedState ? "mark as accounted" : "mark as not accounted";
    const isConfirmed = window.confirm(`Are you sure you want to ${action}?`);

    if (!isConfirmed) {
      return;
    }

    try {
      await markAsAccountedMutation.mutateAsync(id);
    } catch (error) {
      console.log("Error updating accountant status:", error);
    }
  };

  //
  // Handle open note modal
  const handleOpenNoteModal = (id, note) => {
    setSelectedPaymentId(id);
    setSelectedNote(note || "");
    setNoteField(note || "");
    setNoteModalOpen(true);
  };

  // Handle close note modal
  const handleCloseNoteModal = () => {
    setNoteModalOpen(false);
    setSelectedPaymentId(null);
    setSelectedNote("");
    setNoteField("");
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!selectedPaymentId) return;

    try {
      await updateNoteMutation.mutateAsync({
        id: selectedPaymentId,
        note: noteField,
      });

      // Close modal after successful save
      handleCloseNoteModal();
    } catch (error) {
      console.log("Error saving note:", error);
      // You might want to show an error message here
    }
  };
  //

  //  handle navigation
  const handleViewDetails = (paymentId) => {
    // navigate(`/dashboard/shipping-client/${paymentId}`);
    // Determine base URL
    const url = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://cashif.online";
    window.open(`${url}/shipping-client/${paymentId}`, "_blank");
  };

  //
  const columns = [
    {
      field: "index",
      headerName: "#",
      width: 50,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => params.value, // Keep showing the row numbers
    },
    {
      field: "isShipped",
      headerName: "Shipped",
      flex: 1,
      minWidth: 75,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <Checkbox
          checked={!!params.row.isShipped}
          onChange={(event) => handleShippedChange(params.row.id, params.row.isShipped)}
          disabled={markAsShippedMutation.isPending || fetchAllShippingPaymensStatus === "fetching"}
          sx={{
            color: "#ff9800",
            "&.Mui-checked": {
              color: "#2e7d32", // Green when checked/shipped
            },
            "&.Mui-disabled": {
              color: "#ccc",
            },
            pointerEvents: "auto", // Override the row's pointer-events: none
          }}
          inputProps={{
            "aria-label": params.row.isShipped ? "Mark as not shipped" : "Mark as shipped",
          }}
        />
      ),
    },

    {
      field: "date", // This will be the date part only
      headerName: "Date",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "time", // This will be the time part only
      headerName: "Time",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return formatTime(params.value);
      },
    },
    {
      field: "reportNumber",
      headerName: "Card Number",
      flex: 1,
      minWidth: 175,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value === "paid" ? (
          <div style={{ backgroundColor: "#2e7d32", color: "#fff" }}>{params.value}</div>
        ) : (
          <div style={{ backgroundColor: "#d32f2f", color: "#fff" }}>{params.value}</div>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 175,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? params.value : <div>N/A</div>;
      },
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 125,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? params.value : <div>N/A</div>;
      },
    },
    {
      field: "branch",
      headerName: "From",
      flex: 1,
      minWidth: 125,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => <div>{params.value}</div>,
    },

    {
      field: "to",
      headerName: "To",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => <div dir="rtl">{Math.trunc(params.value)} ريال</div>,
    },
    {
      field: "model",
      headerName: "Model",
      flex: 1,
      minWidth: 125,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? params.value : <div>N/A</div>;
      },
    },
    {
      field: "shippingType",
      headerName: "Shipping Type",
      flex: 1,
      minWidth: 125,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
    {
      field: "plateNumber",
      headerName: "Plate Number",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,

      renderCell: (params) => {
        return params.value ? <div dir="rtl">{params.value}</div> : <div>N/A</div>;
      },
    },
    {
      field: "payment_id",
      headerName: "Payment Id",
      flex: 1,
      minWidth: 350,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
    {
      field: "note",
      headerName: "Note",
      flex: 1,
      minWidth: 300,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      cellClassName: style.actionsColumn,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <Button
            dir="rtl"
            variant="outlined"
            size="small"
            onClick={() => handleOpenNoteModal(params.row.id, params.row.note)}
            sx={{
              pointerEvents: "auto",
              minWidth: "100px",
              // maxWidth: "200px",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              // backgroundColor: params.row.note ? "#e3f2fd" : "transparent",
              // borderColor: params.row.note ? "#1976d2" : "#ccc",
              color: params.row.note ? "#1976d2" : "#666",
              backgroundColor: params.row.note ? "#bbdefb" : "#f5f5f5",
              "&:hover": {
                // borderColor: params.row.note ? "#1565c0" : "#999",
              },
            }}
          >
            {params.row.note ? (
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  // maxWidth: "150px",
                }}
              >
                {params.row.note.length > 40 ? `${params.row.note.substring(0, 40)}...` : params.row.note}
              </span>
            ) : (
              "Add Note"
            )}
          </Button>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      cellClassName: style.actionsColumn,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {/* View Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewDetails(params.row.id)}
            sx={{
              pointerEvents: "auto",
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
          >
            View
          </Button>
        </div>
      ),
    },

    // Conditionally add the column based on the user's role
    ...(cookies.role === 100 || cookies.role === 255 // Accountent
      ? [
          {
            field: "accountant_status",
            headerName: "Accounted",
            flex: 1,
            minWidth: 100,
            sortable: false,
            headerAlign: "center",
            align: "center",
            disableColumnMenu: true,
            renderCell: (params) => (
              <Tooltip title={params.row.accountant_status ? "Mark as not accounted" : "Mark as accounted"}>
                <Switch
                  checked={!!params.row.accountant_status}
                  onChange={(event) => handleAccountedChange(params.row.id, params.row.accountant_status)}
                  disabled={markAsAccountedMutation.isPending || fetchAllShippingPaymensStatus === "fetching"}
                  color="primary"
                  sx={{
                    "& .MuiSwitch-switchBase": {
                      "&.Mui-checked": {
                        color: "#1976d2",
                        "& + .MuiSwitch-track": {
                          backgroundColor: "#1976d2",
                        },
                      },
                    },
                    pointerEvents: "auto",
                  }}
                  inputProps={{
                    "aria-label": params.row.accountant_status ? "Accounted" : "Not accounted",
                  }}
                />
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-GB", options);
  };

  // Responsive table
  const [containerWidth, setContainerWidth] = useState(window.innerWidth < 600 ? window.innerWidth - 48 : "100%");

  const updateContainerWidth = () => {
    if (window.innerWidth < 600) {
      setContainerWidth(window.innerWidth - 48);
    } else {
      setContainerWidth("100%");
    }
  };

  useEffect(() => {
    // Set initial width
    updateContainerWidth();

    // Update width on window resize
    window.addEventListener("resize", updateContainerWidth);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  return (
    <div className={style.container}>
      {isGetAllShippingPaymensPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      {/* Table */}
      <div
        className={style.datagrid_container}
        style={{
          width: containerWidth, // Set width dynamically
        }}
      >
        <DataGrid
          getRowClassName={(params) => (params.row.isShipped ? style.shippedRow : style.NotshippedRow)}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 100 },
            },
          }}
          checkboxSelection={false} // Disable checkbox selection
          pageSizeOptions={[10, 25, 50, 100]}
          disableMultipleRowSelection
          // disableColumnFilter // Disable filtering
          disableColumnSort // Disable sorting
          disableMultipleColumnSorting // Disable multiple column sorting
          // disableColumnMenu // Hide column menu
          style={{ width: "100%", height: "100%", overflowX: "auto" }}
          sx={{
            "& .MuiDataGrid-row": {
              pointerEvents: "none", // Disable hover/click effects
            },
          }}
          disableRowSelectionOnClick // Prevents selection on click
          disableVirtualization // Sometimes helps with styling issues
        />
      </div>

      {/* Edit Note Modal */}
      <Dialog open={noteModalOpen} onClose={handleCloseNoteModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ padding: "24px", paddingBottom: "16px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedNote ? "Edit Note" : "Add Note"}</Typography>
            <IconButton onClick={handleCloseNoteModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dir="rtl">
          <TextField
            dir="rtl"
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={noteField}
            onChange={(e) => setNoteField(e.target.value)}
            variant="outlined"
            disabled={updateNoteMutation.isPending}
            className={style.modal_text_eria}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "24px", paddingTop: "0px" }}>
          {/* <Button onClick={handleCloseNoteModal} disabled={updateNoteMutation.isPending}>
            Cancel
          </Button> */}
          <Button sx={{ margin: "auto" }} onClick={handleSaveNote} variant="contained" disabled={updateNoteMutation.isPending}>
            {updateNoteMutation.isPending ? "Saving..." : "Save Note"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
