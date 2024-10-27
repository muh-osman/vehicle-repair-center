import style from "./Requests.module.scss";
import { useState, useEffect } from "react";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import { DataGrid } from "@mui/x-data-grid";
// Axios
import axios from "axios";
// API
const apiUrl = process.env.REACT_APP_PAYMENY_SYSTEM_API_URL;

export default function Requests() {
  const columns = [
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
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value === "Paid" ? (
          <div style={{ backgroundColor: "#2e7d32", color: "#fff" }}>
            {params.value}
          </div>
        ) : (
          <div style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            {params.value}
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
      field: "year",
      headerName: "Year",
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return params.value === "2" ? (
          <div dir="rtl">2015 أو أعلى</div>
        ) : (
          <div dir="rtl">2014 أو أدنى</div>
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
        return params.value ? (
          params.value
        ) : (
          <div style={{ color: "#757575" }}>N/A</div>
        );
      },
    },
    {
      field: "additionalServices",
      headerName: "AdditionalServices",
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
      field: "created_at",
      headerName: "Date",
      flex: 1,
      minWidth: 200,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
      renderCell: (params) => {
        return formatDate(params.value); // Use the formatDate function to format the date
      },
    },
  ];

  const [loadding, setLoadding] = useState(false);
  const [data, setData] = useState([]);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });

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
        additionalServices: client.additionalServices,
        service: client.service,
        created_at: client.created_at,
        status: client.un_paid_qr_code ? "Unpaid" : "Paid", // Optional: Add a status based on QR code
      }));
      // console.log(response.data);
      setData(transformedData);
      console.log(transformedData);

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
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options).replace(",", " at");
  };

  const rows =
    data?.map((client, index) => ({
      id: client.qr_code,
      barCode: client.qr_code, // Use the unified qr_code
      status: client.status, // Optional: Use the status if you added it
      name: client.full_name,
      phone: client.phone,
      branch: client.branch,
      plan: client.plan,
      price: client.price,
      model: client.model,
      year: client.year,
      service: client.service,
      additionalServices: client.additionalServices,
      created_at: client.created_at,
    })) || [];

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

  return (
    <div className={style.container}>
      {loadding && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

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
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableMultipleRowSelection
          // disableColumnFilter // Disable filtering
          disableColumnSort // Disable sorting
          disableMultipleColumnSorting // Disable multiple column sorting
          // disableColumnMenu // Hide column menu
          style={{ width: "100%", height: "100%", overflowX: "auto" }}
          filterModel={filterModel} // Set the filter model
          onFilterModelChange={(model) => setFilterModel(model)} // Update filter model on change
        />
      </div>
    </div>
  );
}
