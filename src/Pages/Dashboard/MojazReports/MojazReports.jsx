import style from "./MojazReports.module.scss";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// MUI
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
// Icons
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
// Axios
import axios from "axios";
// Excel Export
import { DownloadTableExcel } from "react-export-table-to-excel";
// Images
import Moyasar from "../../../Assets/Images/moyasar.png";
// Date picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function MojazReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const tableRef = useRef();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}api/mojaz/all-orders`);
      // const response = await axios.get(`http://localhost:8000/api/mojaz/all-orders`);
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      alert("PDF not available yet.");
    }
  };

  const buildRows = (source) =>
    source.map((order, index) => ({
      id: order.id,
      index: source.length - index,
      date: order.created_at,
      time: order.created_at,
      gateway: "Moyasar",
      amount: order.amount,
      email: order.email || "N/A",
      lookup_type: order.lookup_type,
      lookup_value: order.lookup_value,
      name: order.name,
      phone: order.phone,
      payment_id: order.payment_id,
      status: order.status,
      user_id: order.user_id,
      mojaz_request_id: order.mojaz_request_id,
      pdf_url: order.pdf_url || null,
      created_at: order.created_at,
      main_report_number: order.main_report_number || "N/A",
    }));

  const handleDateRangeChange = (index, newValue) => {
    setDateRange((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });
  };

  const rows = buildRows(data).filter((order) => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day").toDate();
      const endDate = dateRange[1].endOf("day").toDate();
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    }
    return true;
  });

  const columns = [
    {
      field: "index",
      headerName: "",
      width: 70,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderHeader: () => (
        <DownloadTableExcel filename="mojaz_orders" sheet="orders" currentTableRef={tableRef.current}>
          <IconButton
            size="small"
            color="primary"
            title="Export to Excel"
            sx={{
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.12)" },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </DownloadTableExcel>
      ),
      renderCell: (params) => params.value,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "time",
      headerName: "Time",
      flex: 1,
      minWidth: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: "gateway",
      headerName: "Gateway",
      flex: 1,
      minWidth: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: () => (
        <div style={{ width: "100%", textAlign: "center" }}>
          <img src={Moyasar} alt="Moyasar" style={{ maxWidth: "100%", maxHeight: "50px" }} />
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const statusConfig = {
          paid: { color: "primary", variant: "outlined" },
          processing: { color: "warning", variant: "outlined" },
          ready: { color: "success", variant: "filled" },
          failed: { color: "error", variant: "filled" },
        };
        const config = statusConfig[params.value] || { color: "default", variant: "outlined" };
        return params.value ? (
          <Chip label={params.value} color={config.color} variant={config.variant} size="small" sx={{ textTransform: "capitalize", fontWeight: 600, pointerEvents: "auto" }} />
        ) : (
          <Chip label="N/A" size="small" variant="outlined" color="default" />
        );
      },
    },
    {
      field: "amount",
      headerName: "Price",
      flex: 1,
      minWidth: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <div dir="rtl">{Math.trunc(params.value)} ريال</div>,
    },
    {
      field: "email",
      headerName: "Branch",
      flex: 1,
      minWidth: 160,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "lookup_type",
      headerName: "Lookup Type",
      flex: 1,
      minWidth: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const lookupTypeMap = { sequence: "رقم التسلسلي", vin: "رقم الهيكل" };
        const label = lookupTypeMap[params.value];
        return label ? (
          <div dir="rtl" style={{ fontWeight: 500 }}>
            {label}
          </div>
        ) : (
          <div style={{ color: "#757575" }}>N/A</div>
        );
      },
    },
    {
      field: "lookup_value",
      headerName: "Lookup Value",
      flex: 1,
      minWidth: 160,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (params.value ? params.value : <div style={{ color: "#757575" }}>N/A</div>),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 160,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "user_id",
      headerName: "User ID",
      flex: 1,
      minWidth: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (params.value ? params.value : <div style={{ color: "#757575" }}>N/A</div>),
    },
    {
      field: "main_report_number",
      headerName: "Main Report Id",
      flex: 1,
      minWidth: 180,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (params.value ? params.value : <div style={{ color: "#757575" }}>N/A</div>),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "mojaz_request_id",
      headerName: "Mojaz Request ID",
      flex: 1,
      minWidth: 170,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (params.value ? params.value : <div style={{ color: "#757575" }}>N/A</div>),
    },
    {
      field: "payment_id",
      headerName: "Payment ID",
      flex: 1,
      minWidth: 200,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (params.value ? params.value : <div style={{ color: "#757575" }}>N/A</div>),
    },
    {
      field: "pdf_url",
      headerName: "Report",
      flex: 1,
      minWidth: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewPdf(params.value)}
            disabled={!params.value}
            sx={{
              pointerEvents: "auto",
              backgroundColor: params.value ? "#1976d2" : "#ccc",
              "&:hover": { backgroundColor: params.value ? "#1565c0" : "#ccc" },
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const [containerWidth, setContainerWidth] = useState(window.innerWidth < 600 ? window.innerWidth - 48 : "100%");

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth < 600 ? window.innerWidth - 48 : "100%");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={style.container}>
      {loading && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <Stack sx={{ pb: 2, maxWidth: "617px", margin: "auto" }} spacing={2} justifyContent="center" direction={{ xs: "row", sm: "row" }} alignItems="stretch">
        <Button
          sx={{
            width: "100%",
            flex: 1,
          }}
          color="secondary"
          size="large"
          variant="outlined"
          onClick={() => navigate("/dashboard/mojaz-analytics")}
        >
          Analytics
        </Button>
      </Stack>

      <Stack dir="ltr" sx={{ pb: 2, maxWidth: "617px", margin: "auto", direction: "ltr" }} spacing={2} justifyContent="center" direction={{ xs: "row", sm: "row" }} alignItems="stretch">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack dir="ltr" direction={{ xs: "row", sm: "row" }} spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 2, width: "100%", direction: "ltr" }}>
            <DatePicker
              label="Start Date"
              value={dateRange[0] ?? null}
              onChange={(newValue) => handleDateRangeChange(0, newValue)}
              maxDate={dateRange[1] ?? dayjs()}
              slotProps={{
                textField: { size: "small" },
                popper: {
                  sx: { direction: "ltr" },
                },
                mobilePaper: {
                  sx: { direction: "ltr" },
                  dir: "ltr",
                },
              }}
              sx={{ width: "100%" }}
            />
            <DatePicker
              label="End Date"
              value={dateRange[1] ?? null}
              onChange={(newValue) => handleDateRangeChange(1, newValue)}
              minDate={dateRange[0] ?? undefined}
              maxDate={dayjs()}
              slotProps={{
                textField: { size: "small" },
                popper: {
                  sx: { direction: "ltr" },
                },
                mobilePaper: {
                  sx: { direction: "ltr" },
                  dir: "ltr",
                },
              }}
              sx={{ width: "100%" }}
            />
          </Stack>
        </LocalizationProvider>
      </Stack>

      {/* Hidden table for Excel export */}
      <table ref={tableRef} style={{ display: "none" }}>
        <thead>
          <tr>
            <th>No</th>
            <th>Date</th>
            <th>Time</th>
            <th>Gateway</th>
            <th>Status</th>
            <th>Price</th>
            <th>Branch</th>
            <th>Lookup Type</th>
            <th>Lookup Value</th>
            <th>Name</th>
            <th>User ID</th>
            <th>Phone</th>
            <th>Mojaz Request ID</th>
            <th>Payment ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.index}</td>
              <td>{formatDate(row.date)}</td>
              <td>{formatTime(row.time)}</td>
              <td>Moyasar</td>
              <td>{row.status || "N/A"}</td>
              <td>{row.amount}</td>
              <td>{row.email}</td>
              <td>{row.lookup_type === "sequence" ? "رقم التسلسلي" : row.lookup_type === "vin" ? "رقم الهيكل" : row.lookup_type || "N/A"}</td>
              <td>{row.lookup_value || "N/A"}</td>
              <td>{row.name || "N/A"}</td>
              <td>{row.user_id || "N/A"}</td>
              <td>{row.phone || "N/A"}</td>
              <td>{row.mojaz_request_id || "N/A"}</td>
              <td>{row.payment_id || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={style.datagrid_container} style={{ width: containerWidth }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 100 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection={false}
          disableMultipleRowSelection
          disableColumnSort
          disableMultipleColumnSorting
          disableRowSelectionOnClick
          style={{ width: "100%", height: "100%", overflowX: "auto" }}
          sx={{ "& .MuiDataGrid-row": { pointerEvents: "none" } }}
        />
      </div>
    </div>
  );
}
