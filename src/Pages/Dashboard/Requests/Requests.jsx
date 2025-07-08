import style from "./Requests.module.scss";
import { useState, useEffect, useRef } from "react";
// MUI
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { DataGrid } from "@mui/x-data-grid";
// import TableChartIcon from "@mui/icons-material/TableChart";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
// Axios
import axios from "axios";
// Cookies
import { useCookies } from "react-cookie";
// Excel Export
import { DownloadTableExcel } from "react-export-table-to-excel";
// Images
import Tabby from "../../../Assets/Images/tabby.png";
import Tamara from "../../../Assets/Images/tamara.png";
import Moyasar from "../../../Assets/Images/moyasar.png";
import unPaid from "../../../Assets/Images/unPaid.png";
// API
const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function Requests() {
  // Cookie
  const [cookies, setCookie] = useCookies(["role"]);

  const [open, setOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  // Export As Excel Button
  const tableRef = useRef();
  //
  const handleDelete = (id) => {
    setItemIdToDelete(id);
    setOpen(true);
  };

  const cancelDelete = () => {
    setOpen(false);
    console.log("Item not deleted.");
  };

  const deleteAction = async (id) => {
    try {
      console.log(id);
      // Send delete request to the backend
      await axios.delete(`${apiUrl}api/delete-client/${id}`);
      // Update the state to remove the deleted item
      setData((prevData) => prevData.filter((client) => client.qr_code !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const confirmDelete = async () => {
    // console.log(itemIdToDelete);
    await deleteAction(itemIdToDelete);
    // Add your delete logic here
    setOpen(false);
  };

  //
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
        <DownloadTableExcel
          filename="orders table"
          sheet="orders"
          currentTableRef={tableRef.current}
        >
          <IconButton
            size="small"
            color="primary"
            title="Export to Excel"
            sx={{
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.12)",
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </DownloadTableExcel>
      ),
      renderCell: (params) => params.value, // Keep showing the row numbers
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
      field: "gateway",
      headerName: "Gateway",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        let imageSrc;
        switch (params.value) {
          case "Tamara":
            imageSrc = Tamara;
            break;
          case "Tabby":
            imageSrc = Tabby;
            break;
          case "Moyasar":
            imageSrc = Moyasar;
            break;
          default:
            imageSrc = unPaid; // or a default image if you have one
        }

        return (
          <div style={{ width: "100%", textAlign: "center" }}>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={params.value}
                style={{ maxWidth: "100%", maxHeight: "50px" }}
              />
            ) : null}
          </div>
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
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 1,
      minWidth: 125,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
    {
      field: "plan",
      headerName: "Plan",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
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
      renderCell: (params) => (
        <div dir="rtl">{Math.trunc(params.value)} ريال</div>
      ),
    },
    {
      field: "discountCode",
      headerName: "Discount code",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? params.value : <div>N/A</div>;
      },
    },
    {
      field: "marketerShare",
      headerName: "Marketer share",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? (
          <div dir="rtl">{Math.trunc(params.value)} ريال</div>
        ) : (
          <div>N/A</div>
        );
      },
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
    },
    {
      field: "mergedYear",
      headerName: "Year",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        // Use fullYear if available, otherwise use year
        const value = params.row.fullYear || params.row.year;
        return value ? (
          value === "2" ? (
            <div dir="rtl">2017 أو أعلى</div>
          ) : value === "1" ? (
            <div dir="rtl">2016 أو أدنى</div>
          ) : (
            value
          )
        ) : (
          <div>N/A</div>
        );
      },
    },
    {
      field: "service",
      headerName: "Service",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? params.value : <div>N/A</div>;
      },
    },
    {
      field: "additionalServices",
      headerName: "Additional Services",
      flex: 1,
      minWidth: 200,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? (
          params.value
        ) : (
          <div style={{ color: "#757575" }}>N/A</div>
        );
      },
    },
    {
      field: "barCode",
      headerName: "Reference Number",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
    // {
    //   field: "affiliate",
    //   headerName: "Affiliate",
    //   flex: 1,
    //   minWidth: 150,
    //   sortable: false,
    //   headerAlign: "center",
    //   align: "center",
    //   filterable: true,
    //   renderCell: (params) => {
    //     return params.value ? (
    //       params.value
    //     ) : (
    //       <div style={{ color: "#757575" }}>N/A</div>
    //     );
    //   },
    // },
    {
      field: "date_of_visited",
      headerName: "Date of visited",
      flex: 1,
      minWidth: 170,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value ? (
          <div>
            {formatDate(params.value)} - {formatTime(params.value)}
          </div>
        ) : (
          <div style={{ color: "#fff" }}>N/A</div>
        );
      },
    },

    // Conditionally add the Delete column based on the user's role
    ...(cookies.role === 255
      ? [
          {
            field: "delete",
            headerName: "Delete",
            width: 150,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
              <div style={{ pointerEvents: "auto" }}>
                {" "}
                {/* Add this wrapper */}
                <IconButton
                  variant="contained"
                  sx={{ backgroundColor: "#c5ebff" }}
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const [loadding, setLoadding] = useState(false);
  const [data, setData] = useState([]);
  const [activeButton, setActiveButton] = useState("all");

  const scanUserPayment = async () => {
    try {
      setLoadding(true);

      const response = await axios.get(
        `${apiUrl}api/get-all-clients-paid-and-unpaid`
      );

      // Transform the data to unify the QR code keys
      const transformedData = response.data.map((client) => ({
        qr_code: client.un_paid_qr_code || client.paid_qr_code, // Use whichever QR code is available
        full_name: client.full_name,
        phone: client.phone,
        branch: client.branch,
        plan: client.plan,
        price: client.price,
        model: client.model,
        year: client.year,
        full_year: client.full_year,
        additionalServices: client.additionalServices,
        service: client.service,
        affiliate: client.affiliate,
        date_of_visited: client.date_of_visited,
        discountCode: client.discountCode,
        marketerShare: client.marketerShare,
        created_at: client.created_at,
        gateway: client.table_name,
        visited: client.date_of_visited,
      }));
      // console.log(response.data);
      setData(transformedData);
      // console.log(transformedData);

      setLoadding(false);
    } catch (err) {
      console.log(err);
      setLoadding(false);
    }
  };

  useEffect(() => {
    scanUserPayment();
  }, []);

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

  const rows = data
    .map((client, index) => ({
      index: data.length - index,
      date: client.created_at, // Will be formatted as date only
      time: client.created_at, // Will be formatted as time only
      created_at: client.created_at,
      gateway: client.gateway,
      name: client.full_name,
      phone: client.phone,
      branch: client.branch,
      plan: client.plan,
      price: client.price,
      model: client.model,
      year: client.year,
      fullYear: client.full_year,
      mergedYear: client.full_year || client.year, // this is the merged field
      service: client.service,
      additionalServices: client.additionalServices,
      visited: client.visited,
      id: client.qr_code,
      barCode: client.qr_code,
      affiliate: client.affiliate,
      date_of_visited: client.date_of_visited,
      discountCode: client.discountCode,
      marketerShare: client.marketerShare,
    }))
    .filter((client) => {
      if (activeButton === "all") return true;
      if (activeButton === "visited") return client.visited; // Assuming visited is truthy if visited
      if (activeButton === "notVisited") return !client.visited; // Assuming visited is truthy if visited
      return true; // Fallback
    });

  // Responsive table
  const [containerWidth, setContainerWidth] = useState(
    window.innerWidth < 600 ? window.innerWidth - 48 : "100%"
  );

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

  // Filtter Button
  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);
  };

  return (
    <div className={style.container}>
      {loadding && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <Dialog open={open} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            No
          </Button>
          <Button onClick={confirmDelete} color="error">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Stack
        sx={{ pb: 3, maxWidth: "617px", margin: "auto" }}
        spacing={2}
        justifyContent="center"
        direction={{ xs: "row", sm: "row" }}
        alignItems="stretch"
      >
        <Button
          sx={{
            width: "100%",
            flex: 1,
          }}
          color="primary"
          size="large"
          variant={activeButton === "all" ? "contained" : "outlined"}
          onClick={() => handleButtonClick("all")}
        >
          All
        </Button>

        {/* <Button
          sx={{
            width: "100%",
            flex: 1,
          }}
          color="success"
          size="large"
          variant={activeButton === "paid" ? "contained" : "outlined"}
          onClick={() => handleButtonClick("paid")}
        >
          Paid
        </Button> */}

        <Button
          sx={{
            width: "100%",
            flex: 1,
          }}
          color="info"
          size="large"
          variant={activeButton === "visited" ? "contained" : "outlined"}
          onClick={() => handleButtonClick("visited")}
        >
          Visited
        </Button>

        <Button
          sx={{
            width: "100%",
            flex: 1,
          }}
          color="error"
          size="large"
          variant={activeButton === "notVisited" ? "contained" : "outlined"}
          onClick={() => handleButtonClick("notVisited")}
        >
          Not Visited
        </Button>

        {/* <DownloadTableExcel
          filename="orders table"
          sheet="orders"
          currentTableRef={tableRef.current}
        >
          <Button
            sx={{
              width: "100%",
              flex: 1,
            }}
            variant="outlined"
            color="secondary"
            size="large"
          >
            <DownloadIcon />
          </Button>
        </DownloadTableExcel> */}
      </Stack>

      {/* Hidden table for export */}
      <table ref={tableRef} style={{ display: "none" }}>
        <thead>
          <tr>
            <th>No</th>
            <th>Date</th>
            <th>Time</th>
            <th>Gateway</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Branch</th>
            <th>Plan</th>
            <th>Price</th>
            <th>Model</th>
            <th>Year</th>
            <th>Service</th>
            <th>Additional Services</th>
            <th>Reference Number</th>
            <th>Affiliate</th>
            <th>Date of visited</th>
            <th>Discount code</th>
            <th>Marketer share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.index}</td>
              <td>{formatDate(row.date)}</td>
              <td>{formatTime(row.time)}</td>
              <td>{row.gateway}</td>
              <td>{row.name}</td>
              <td>{row.phone}</td>
              <td>{row.branch}</td>
              <td>{row.plan}</td>
              <td>{row.price}</td>
              <td>{row.model}</td>
              <td>{row.mergedYear}</td>
              <td>{row.service || "N/A"}</td>
              <td>{row.additionalServices || "N/A"}</td>
              <td>{row.barCode}</td>
              <td>{row.affiliate || "N/A"}</td>
              <td>{row.date_of_visited || "N/A"}</td>
              <td>{row.discountCode || "N/A"}</td>
              <td>{row.marketerShare || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/*  */}
      <div
        className={style.datagrid_container}
        style={{
          width: containerWidth, // Set width dynamically
        }}
      >
        <DataGrid
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
          getRowClassName={(params) => {
            return params.row.visited ? "visited" : "notVisited";
          }}
          sx={{
            "& .MuiDataGrid-row": {
              pointerEvents: "none", // Disable hover/click effects
            },
          }}
          disableRowSelectionOnClick // Prevents selection on click
          disableVirtualization // Sometimes helps with styling issues
        />
      </div>
    </div>
  );
}
