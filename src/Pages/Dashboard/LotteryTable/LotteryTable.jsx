import useGetAllLotteryApi from "../../../API/useGetAllLotteryApi";
import style from "./LotteryTable.module.scss";
import { useState, useEffect, useRef } from "react";
// MUI
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import { IconButton, Tooltip } from "@mui/material";
// downloadExcel
import { downloadExcel } from "react-export-table-to-excel";

export default function LotteryTable() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, isError } = useGetAllLotteryApi();

  const formatQueryParams = (queryString) => {
    if (!queryString) return "Direct";
    return queryString
      .split("&")
      .map((param) => param.split("=")[1] || param)
      .join(", ");
  };

  //
  const handleExportExcel = () => {
    downloadExcel({
      fileName: "Lottery_Data",
      sheet: "Participants",
      tablePayload: {
        header: ["#", "الاسم", "رقم الجوال", "المصدر", "استخدام الخصم", "تاريخ التسجيل"],
        body: rows.map((row) => [row.index, row.name, row.phone, row.source, row.is_discount_used ? "نعم" : "لا", row.created_at]),
      },
    });
  };

  // 👇 تعريف الأعمدة
  const columns = [
    {
      field: "index",
      width: 70,
      align: "center",
      headerAlign: "center",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Tooltip title="تحميل">
          <IconButton
            color="primary"
            onClick={handleExportExcel}
            size="small"
            disabled={isLoading}
            sx={{
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.12)",
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "name",
      headerName: "الاسم",
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 150,
    },
    {
      field: "phone",
      headerName: "رقم الجوال",
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <span dir="ltr">{params.value}</span>,
    },
    {
      field: "source",
      headerName: "المصدر",
      flex: 1.5,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "is_discount_used",
      headerName: "استخدام الخصم",
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (params.value ? <span className={style.used}>نعم</span> : <span className={style.notUsed}>لا</span>),
    },
    {
      field: "created_at",
      headerName: "تاريخ التسجيل",
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 150,
    },
  ];

  // 👇 تجهيز الصفوف
  const rows = data?.map((row, index) => ({
    id: row.id, // مهم جدًا للـ DataGrid
    index: data.length - index, // 👈 reversed index
    name: row.name,
    phone: row.phone,
    source: formatQueryParams(row.query_params),
    is_discount_used: row.is_discount_used,
    created_at: new Date(row.created_at).toLocaleDateString("en-GB"),
  }));

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

  if (isLoading) {
    return (
      <div style={{ textAlign: "center" }} className={style.container}>
        جاري تحميل البيانات...
      </div>
    );
  }

  if (isError) {
    return <div className={style.container}>حدث خطأ أثناء جلب البيانات</div>;
  }
  return (
    <div className={style.container}>
      <h2>سجل المشاركين في السحب</h2>

      <Box sx={{ width: containerWidth }} className={style.datagrid_container}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={isLoading}
          sx={{
            fontFamily: "inherit",
            direction: "ltr",
            width: "100%",
            height: "100%",
            overflowX: "auto",
            "& .MuiDataGrid-footerContainer p": {
              margin: 0,
            },
          }}
        />
      </Box>
    </div>
  );
}
