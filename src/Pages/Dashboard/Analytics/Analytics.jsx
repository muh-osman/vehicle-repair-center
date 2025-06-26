import style from "./Analytics.module.scss";
import { useState, useEffect } from "react";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import { DataGrid } from "@mui/x-data-grid";
// API
import useGetUsersAnalyticsApi from "../../../API/useGetUsersAnalyticsApi";

export default function Analytics() {
  const { data, isPending: isGetUsersAnalyticsPending } =
    useGetUsersAnalyticsApi();

  const columns = [
    {
      field: "index",
      headerName: "No.",
      width: 70,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "ip_address",
      headerName: "IP Address",
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      minWidth: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "visit_count",
      headerName: "Visits",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "last_visit_at",
      headerName: "Last Visit",
      flex: 1,
      minWidth: 180,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return formatDateTime(params.value);
      },
    },
  ];

  // Format as "2025-06-23 06:55 AM/PM"
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Pad with leading zeros
    const pad = (num) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    // 12-hour format with AM/PM
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = pad(date.getMinutes());

    return `${day}-${month}-${year} / ${pad(hours)}:${minutes} ${ampm}`;
  };

  // Safely handle data mapping
  const rows = Array.isArray(data?.data)
    ? data.data.map((visitor, index) => ({
        id: visitor.ip_address || index,
        index: index + 1,
        ip_address: visitor.ip_address || "N/A",
        country: visitor.country || "Unknown",
        visit_count: visitor.visit_count || 0,
        last_visit_at: visitor.last_visit_at || null,
      }))
    : [];

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
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  return (
    <div className={style.container}>
      {isGetUsersAnalyticsPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <div
        className={style.datagrid_container}
        style={{ width: containerWidth }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          checkboxSelection={false}
          pageSizeOptions={[10]}
          disableMultipleRowSelection
          disableColumnSort
          disableMultipleColumnSorting
          style={{ width: "100%", height: "100%", overflowX: "auto" }}
          getRowClassName={() => "analytics-row"}
        />
      </div>
    </div>
  );
}
