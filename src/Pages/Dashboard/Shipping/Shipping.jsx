import style from "./Shipping.module.scss";
import { useState, useEffect } from "react";
// API
import useGetAllShippingPaymensApi from "../../../API/useGetAllShippingPaymensApi";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import { DataGrid } from "@mui/x-data-grid";

export default function Shipping() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  //
  const { data, isPending: isGetAllShippingPaymensPending, isSuccess } = useGetAllShippingPaymensApi();

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
    })) || [];

  //
  const columns = [
    {
      field: "index",
      headerName: "#",
      width: 70,
      sortable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
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
      field: "reportNumber",
      headerName: "Report Number",
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
      field: "payment_id",
      headerName: "Payment Id",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      filterable: true,
    },
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
