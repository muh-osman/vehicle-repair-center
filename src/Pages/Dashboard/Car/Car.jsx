import style from "./Car.module.scss";
import { useState } from "react";
import { useParams } from "react-router-dom";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
// API
import useGetCarPricesByIdAndYearApi from "../../../API/useGetCarPricesByIdAndYearApi";

export default function Car() {
  const [variant, setVariant] = useState(false);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const { id } = useParams();

  const data = {
    modelId: id,
    yearId: variant ? "2" : "1",
  };

  const {
    data: carModelData,
    isSuccess,
    isPending,
    fetchStatus,
  } = useGetCarPricesByIdAndYearApi(data);

  const handleClick = (clickedVariant) => {
    setVariant(clickedVariant);
    setSelectedPrices([]);
    setTotalPrice(0);
    setIsSaleClicked(false);
  };

  const handlePriceClick = (price) => {
    const index = selectedPrices.indexOf(price);
    if (index === -1) {
      setSelectedPrices([...selectedPrices, price]);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + parseFloat(price));
    } else {
      const updatedPrices = [...selectedPrices];
      updatedPrices.splice(index, 1);
      setSelectedPrices(updatedPrices);
      setTotalPrice((prevTotalPrice) => prevTotalPrice - parseFloat(price));
    }
  };

  // Sale
  const [isSaleClicked, setIsSaleClicked] = useState(false);
  const discountedPrice = totalPrice * 0.9; // 10% discount

  // Progress
  const progress = () => {
    if (fetchStatus === "fetching") {
      return (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={style.container}>
      {progress()}
      <Stack
        spacing={2}
        direction="row"
        justifyContent="center"
        marginTop={4}
        marginBottom={4}
      >
        <Button
          onClick={() => handleClick(true)}
          variant={variant ? "contained" : "outlined"}
        >
          سنة 2015 أو أعلى
        </Button>
        <Button
          onClick={() => handleClick(false)}
          variant={variant ? "outlined" : "contained"}
        >
          سنة 2014 أو أدنى
        </Button>
      </Stack>

      <div dir="rtl" style={{ padding: "0px 16px 16px" }}>
        <h1>{carModelData?.[0].model_name}</h1>
        <h1>{carModelData?.[0].manufacturer_name}</h1>
      </div>

      <TableContainer dir="rtl" component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {carModelData?.[0].prices.map((price) => (
                <TableCell align="center" key={price.service_name}>
                  {price.service_name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {carModelData?.[0].prices.map((price) => (
                <TableCell
                  className={style.cell}
                  align="center"
                  key={price.service_name}
                  onClick={() => handlePriceClick(price.price)}
                  style={{
                    backgroundColor: selectedPrices.includes(price.price)
                      ? "#757575"
                      : "#fff",
                    color: selectedPrices.includes(price.price)
                      ? "#fff"
                      : "#757575",
                  }}
                >
                  {price.price}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Price */}
      {carModelData && (
        <h2 className={isSaleClicked ? "originalPrice" : ""}>
          Total Price: {totalPrice.toFixed(2)}
        </h2>
      )}

      {/* Sale */}
      {isSaleClicked && carModelData && (
        <h2>Total Price: {discountedPrice.toFixed(2)}</h2>
      )}

      {/* Sale btn */}
      {carModelData && (
        <div className={style.saleBtn}>
          <IconButton
            color="primary"
            onClick={() => setIsSaleClicked((prevState) => !prevState)}
          >
            <LoyaltyIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
