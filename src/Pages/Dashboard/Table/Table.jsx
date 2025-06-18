// Table.js
import style from "./Table.module.scss";
import { useEffect, useRef } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { toast } from "react-toastify";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
// API
import useFetchAllTableDataApi from "../../../API/useFetchAllTableDataApi";
// Excel
import { DownloadTableExcel } from "react-export-table-to-excel";
// Cookies
import { useCookies } from "react-cookie";

export default function TablePage() {
  const tableRef = useRef(null);
  const [cookies, setCookie] = useCookies(["role"]);

  const { data, isLoading, isError, error, fetchStatus, isSuccess } =
    useFetchAllTableDataApi();

  useEffect(() => {
    if (isError) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "An error occurred";
      toast.error(errorMessage);
    }
  }, [error]);

  let modelsData = [];

  if (data) {
    const groupByModel = data.reduce((acc, item) => {
      const key = `${item.model_name}-${item.manufacturer}-${item.country}-${item.year}`;
      if (!acc[key]) {
        acc[key] = {
          model_name: item.model_name,
          manufacturer: item.manufacturer,
          country: item.country,
          year: item.year,
          services: {},
        };
      }
      acc[key].services[item.service_name] = item.price;
      return acc;
    }, {});

    modelsData = Object.values(groupByModel);
  }

  const getRowColorClass = (index) => {
    return index % 4 < 2 ? style.redRow : style.blueRow;
  };

  return (
    <div className={style.container}>
      {fetchStatus === "fetching" && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <DownloadTableExcel
        filename="cashif table"
        sheet="cashif"
        currentTableRef={tableRef.current}
      >
        {cookies.role === 255 && (
          <Button sx={{ marginBottom: "16px" }} variant="outlined">
            Export excel
          </Button>
        )}
      </DownloadTableExcel>

      <TableContainer component={Paper}>
        <Table aria-label="simple table" ref={tableRef}>
          <TableHead>
            <TableRow>
              <TableCell align="center">كمبيوتر</TableCell>
              <TableCell align="center">هيكل خارجي</TableCell>
              <TableCell align="center">محركات</TableCell>
              <TableCell align="center">أساسي</TableCell>
              <TableCell align="center">شامل</TableCell>
              <TableCell align="center">Year</TableCell>
              <TableCell align="center">Model</TableCell>
              <TableCell align="center">Manufacturer</TableCell>
              <TableCell align="center">Country</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modelsData.map(
              (
                { model_name, manufacturer, country, year, services },
                index
              ) => (
                <TableRow
                  key={index}
                  className={`${style.row} ${getRowColorClass(index)}`}
                >
                  <TableCell align="center">
                    {services["كمبيوتر"] || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {services["هيكل خارجي"] || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {services["محركات"] || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {services["أساسي"] || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {services["شامل"] || "-"}
                  </TableCell>

                  <TableCell align="center">{year}</TableCell>
                  <TableCell align="center">
                    <Chip label={model_name} variant="filled" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={manufacturer} variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{country}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
