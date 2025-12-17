import style from "./Car.module.scss";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
// import { Divider } from "@mui/material";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// API
import useGetCarPricesByIdAndYearApi from "../../../API/useGetCarPricesByIdAndYearApi";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Car() {
  // Expand card
  const [expandedId, setExpandedId] = useState(-1);

  const handleExpandClick = (i) => {
    setExpandedId((prevId) => (prevId === i ? -1 : i));
  };

  // Year btn
  const [variant, setVariant] = useState(0);

  const handleChangeYear = (clickedYearId) => {
    setVariant(clickedYearId);
    // Reset all sale
    setIsSaleClicked([{ clicked: false }, { clicked: false }, { clicked: false }, { clicked: false }, { clicked: false }]);
    // Reset expandedId to -1 to close all cards
    setExpandedId(-1);
  };

  const { id } = useParams();

  const data = {
    modelId: id,
    yearId: variant,
  };

  const { data: carModelData, fetchStatus, refetch } = useGetCarPricesByIdAndYearApi(data);

  // Refetch data when variant changes (Years buttons clickes)
  useEffect(() => {
    if (variant) {
      refetch();
    }
  }, [variant]);

  // Sale
  const [isSaleClicked, setIsSaleClicked] = useState([{ clicked: false }, { clicked: false }, { clicked: false }, { clicked: false }, { clicked: false }]);

  // Sale btn
  const handleClick = (clickedVariant, cardIndex) => {
    setIsSaleClicked((prevState) => {
      return prevState.map((item, index) => (index === cardIndex ? { clicked: clickedVariant } : item));
    });
  };

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

  const [sale20, setSale20] = useState(false);
  const sale20Btn = () => {
    setSale20((prevState) => !prevState);

    setIsSaleClicked((prev) => {
      // Create a new array based on the previous state
      const newState = [...prev];
      // Set the clicked property of the first item to true
      newState[0].clicked = false;
      return newState;
    });
  };

  // for firs card only (شامل)
  const sale10BtnForFirstCard = () => {
    setSale20(false);
    handleClick(!isSaleClicked[0].clicked, 0);
  };

  return (
    <div className={style.container}>
      {progress()}
      {/* Years buttons */}
      <Stack spacing={2} direction="row" justifyContent="center" marginTop={4} marginBottom={4}>
        <Button onClick={() => handleChangeYear(2)} variant={variant === 2 ? "contained" : "outlined"}>
          سنة 2017 أو أعلى
        </Button>
        <Button onClick={() => handleChangeYear(1)} variant={variant === 1 ? "contained" : "outlined"}>
          سنة 2016 أو أدنى
        </Button>
      </Stack>

      {carModelData && (
        <div style={{ padding: "0px 16px 22px" }}>
          <Stack direction="row-reverse" spacing={1} justifyContent="center">
            <Chip label={carModelData?.[0].manufacturer_name} />
            <Chip variant="outlined" label={carModelData?.[0].model_name} />
          </Stack>
        </div>
      )}

      {carModelData && (
        <div className={style.card_container}>
          {/* الفحص الشامل */}
          <Card dir="rtl" sx={{ width: 342 }}>
            <div className={style.card_header}>
              <h2>الفحص الشامل</h2>
              {/* Price line  through*/}
              <h3
                style={{
                  textAlign: "center",
                  color: "#757575 !important",
                  fontSize: isSaleClicked[0].clicked || sale20 ? "22px" : "48px",
                  textDecoration: isSaleClicked[0].clicked || sale20 ? "line-through" : "none",
                  fontWeight: isSaleClicked[0].clicked || sale20 ? "600" : "700",
                }}
              >
                {/* {(carModelData && isSaleClicked[0].clicked) ||
                  (sale20 &&
                    carModelData?.[0].prices?.[0].price * (1).toFixed(2) +
                      " ريال")} */}

                {
                  (carModelData && isSaleClicked[0].clicked) || sale20 ? carModelData?.[0].prices?.[0].price * (1).toFixed(2) + " ريال" : null // or any fallback value you want to display when conditions are not met
                }
              </h3>
            </div>

            <CardContent>
              {/* Sale Price 10%*/}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: isSaleClicked[0].clicked ? "#7431fa" : "#757575",
                  fontWeight: "700",
                }}
              >
                {isSaleClicked[0].clicked && carModelData && Math.trunc(carModelData?.[0].prices?.[0].price * 0.9) + " ريال"}
              </Typography>

              {/* Sale Price 20%*/}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: sale20 ? "#d32f2f" : "#757575",
                  fontWeight: "700",
                }}
              >
                {sale20 && carModelData && carModelData?.[0].prices?.[0].price * (0.8).toFixed(2) + " ريال"}
              </Typography>

              {/* Price Orginal */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#757575",
                  fontSize: "48px",
                  fontWeight: "700",
                }}
              >
                {carModelData && !isSaleClicked[0].clicked && !sale20 && carModelData?.[0].prices?.[0].price * (1).toFixed(2) + " ريال"}
              </Typography>
            </CardContent>

            <CardActions disableSpacing>
              <ExpandMore expand={expandedId === 0} onClick={() => handleExpandClick(0)} aria-expanded={expandedId === 0} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>

              {/* Sale btn 20%*/}
              {/* <Tooltip title="20%" arrow>
                <IconButton
                  className={style.sale20Btn}
                  color={sale20 ? "error" : "#757575"}
                  onClick={sale20Btn}
                >
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip> */}

              {/* Sale btn 10%*/}
              <Tooltip title="10%" arrow>
                <IconButton className={style.sale10Btn} color={isSaleClicked[0].clicked ? "primary" : "#757575"} onClick={sale10BtnForFirstCard}>
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip>
            </CardActions>

            <Collapse in={expandedId === 0} timeout="auto" unmountOnExit>
              <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  الأجزاء المشمولة في الفحص
                </Typography>

                <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                  <li style={{ marginBottom: "3px" }}>فحص المحرك</li>
                  <li style={{ marginBottom: "3px" }}>فحص ناقل الحركة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الدفرنس</li>
                  <li style={{ marginBottom: "3px" }}>فحص ميكانيكا أسفل السيارة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الكمبيوتر والحساسات</li>
                  <li style={{ marginBottom: "3px" }}>فحص الهيكل الداخلي (الشاص)</li>
                  <li style={{ marginBottom: "3px" }}>فحص الهيكل الخارجي (السمكرة والدهان)</li>
                  <li style={{ marginBottom: "3px" }}>فحص الوسائد الهوائية (الإيرباق)</li>
                  <li style={{ marginBottom: "3px" }}>تجربة السيارة على الطريق</li>
                  <li style={{ marginBottom: "3px" }}>فحص الديكورات الداخلية</li>
                  <li style={{ marginBottom: "3px" }}>فحص المزايا المخصصة للسيارة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الملحقات الخارجية للسيارة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الزجاج</li>
                  <li style={{ marginBottom: "3px" }}>فحص الكفرات والجنوط</li>
                  <li>فحص الشمعات والأسطبات</li>
                </ul>
              </CardContent>
            </Collapse>
          </Card>

          {/* الفحص الأساسي */}
          <Card dir="rtl" sx={{ width: 342 }}>
            <div className={style.card_header}>
              <h2>الفحص الأساسي</h2>
              {/* Price line  through*/}
              <h3
                style={{
                  textAlign: "center",
                  color: "#757575 !important",
                  fontSize: isSaleClicked[1].clicked ? "22px" : "48px",
                  textDecoration: isSaleClicked[1].clicked ? "line-through" : "none",
                  fontWeight: isSaleClicked[1].clicked ? "600" : "700",
                }}
              >
                {carModelData && isSaleClicked[1].clicked && carModelData?.[0].prices?.[1].price * (1).toFixed(2) + " ريال"}
              </h3>
            </div>

            <CardContent>
              {/* Sale Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: isSaleClicked[1].clicked ? "#d32f2f" : "#757575",
                  fontWeight: "700",
                }}
              >
                {isSaleClicked[1].clicked && carModelData && Math.trunc(carModelData?.[0].prices?.[1].price * 0.95) + " ريال"}
              </Typography>

              {/* Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#757575",
                  fontSize: "48px",
                  fontWeight: "700",
                }}
              >
                {carModelData && !isSaleClicked[1].clicked && carModelData?.[0].prices?.[1].price * (1).toFixed(2) + " ريال"}
              </Typography>
            </CardContent>

            <CardActions disableSpacing>
              <ExpandMore expand={expandedId === 1} onClick={() => handleExpandClick(1)} aria-expanded={expandedId === 1} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>

              {/* Sale btn */}
              <Tooltip title="5%" arrow>
                <IconButton className={style.sale5Btn} color={isSaleClicked[1].clicked ? "error" : "#757575"} onClick={() => handleClick(!isSaleClicked[1].clicked, 1)}>
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip>
            </CardActions>

            <Collapse in={expandedId === 1} timeout="auto" unmountOnExit>
              <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  الأجزاء المشمولة في الفحص
                </Typography>

                <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                  <li style={{ marginBottom: "3px" }}>فحص المحرك</li>
                  <li style={{ marginBottom: "3px" }}>فحص ناقل الحركة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الدفرنس</li>
                  <li style={{ marginBottom: "3px" }}>فحص ميكانيكا أسفل السيارة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الكمبيوتر والحساسات</li>
                  <li style={{ marginBottom: "3px" }}>فحص الهيكل الداخلي (الشاص)</li>
                  <li style={{ marginBottom: "3px" }}>فحص الهيكل الخارجي (السمكرة والدهان)</li>
                  <li style={{ marginBottom: "3px" }}>فحص الوسائد الهوائية (الإيرباق)</li>
                  <li>تجربة السيارة على الطريق</li>
                </ul>
              </CardContent>
            </Collapse>
          </Card>

          {/* فحص المحركات */}
          <Card dir="rtl" sx={{ width: 342 }}>
            <div className={style.card_header}>
              <h2>فحص المحركات</h2>
              {/* Price line  through*/}
              <h3
                style={{
                  textAlign: "center",
                  color: "#757575 !important",
                  fontSize: isSaleClicked[2].clicked ? "22px" : "48px",
                  textDecoration: isSaleClicked[2].clicked ? "line-through" : "none",
                  fontWeight: isSaleClicked[2].clicked ? "600" : "700",
                }}
              >
                {carModelData && isSaleClicked[2].clicked && carModelData?.[0].prices?.[2].price * (1).toFixed(2) + " ريال"}
              </h3>
            </div>

            <CardContent>
              {/* Sale Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: isSaleClicked[2].clicked ? "#d32f2f" : "#757575",
                  fontWeight: "700",
                }}
              >
                {isSaleClicked[2].clicked && carModelData && Math.trunc(carModelData?.[0].prices?.[2].price * 0.95) + " ريال"}
              </Typography>

              {/* Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#757575",
                  fontSize: "48px",
                  fontWeight: "700",
                }}
              >
                {carModelData && !isSaleClicked[2].clicked && carModelData?.[0].prices?.[2].price * (1).toFixed(2) + " ريال"}
              </Typography>
            </CardContent>

            <CardActions disableSpacing>
              <ExpandMore expand={expandedId === 2} onClick={() => handleExpandClick(2)} aria-expanded={expandedId === 2} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>

              {/* Sale btn */}
              <Tooltip title="5%" arrow>
                <IconButton className={style.sale5Btn} color={isSaleClicked[2].clicked ? "error" : "#757575"} onClick={() => handleClick(!isSaleClicked[2].clicked, 2)}>
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip>
            </CardActions>

            <Collapse in={expandedId === 2} timeout="auto" unmountOnExit>
              <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  الأجزاء المشمولة في الفحص
                </Typography>

                <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                  <li style={{ marginBottom: "3px" }}>فحص المحرك</li>
                  <li style={{ marginBottom: "3px" }}>فحص ناقل الحركة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الدفرنس</li>
                  <li style={{ marginBottom: "3px" }}>فحص ميكانيكا أسفل السيارة</li>
                  <li style={{ marginBottom: "3px" }}>فحص الكمبيوتر والحساسات</li>
                  <li style={{ marginBottom: "3px" }}>فحص الهيكل الداخلي (الشاص)</li>
                  <li>تجربة السيارة على الطريق</li>
                </ul>
              </CardContent>
            </Collapse>
          </Card>

          {/* فحص الهيكل الخارجي  */}
          <Card dir="rtl" sx={{ width: 342 }}>
            <div className={style.card_header}>
              <h2>الهيكل الخارجي</h2>
              {/* Price line  through*/}
              <h3
                style={{
                  textAlign: "center",
                  color: "#757575 !important",
                  fontSize: isSaleClicked[3].clicked ? "22px" : "48px",
                  textDecoration: isSaleClicked[3].clicked ? "line-through" : "none",
                  fontWeight: isSaleClicked[3].clicked ? "600" : "700",
                }}
              >
                {carModelData && isSaleClicked[3].clicked && carModelData?.[0].prices?.[3].price * (1).toFixed(2) + " ريال"}
              </h3>
            </div>

            <CardContent>
              {/* Sale Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: isSaleClicked[3].clicked ? "#7431fa" : "#757575",
                  fontWeight: "700",
                }}
              >
                {isSaleClicked[3].clicked && carModelData && carModelData?.[0].prices?.[3].price * (0.9).toFixed(2) + " ريال"}
              </Typography>

              {/* Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#757575",
                  fontSize: "48px",
                  fontWeight: "700",
                }}
              >
                {carModelData && !isSaleClicked[3].clicked && carModelData?.[0].prices?.[3].price * (1).toFixed(2) + " ريال"}
              </Typography>
            </CardContent>

            <CardActions disableSpacing>
              <ExpandMore expand={expandedId === 3} onClick={() => handleExpandClick(3)} aria-expanded={expandedId === 3} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>

              {/* Sale btn */}
              {/* <Tooltip title="10%" arrow>
                <IconButton
                  className={style.sale10Btn}
                  color={isSaleClicked[3].clicked ? "primary" : "#757575"}
                  onClick={() => handleClick(!isSaleClicked[3].clicked, 3)}
                >
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip> */}
            </CardActions>

            <Collapse in={expandedId === 3} timeout="auto" unmountOnExit>
              <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  الأجزاء المشمولة في الفحص
                </Typography>

                <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                  <li style={{ marginBottom: "3px" }}>فحص البودي بجهاز كشف سماكة الطلاء</li>
                  <li style={{ marginBottom: "3px" }}>فحص البودي بالنظر</li>
                  <li style={{ marginBottom: "3px" }}>فحص خشونة الطلاء باليد</li>
                  <li style={{ marginBottom: "3px" }}>اكتشاف أماكن السمكرة والمعجون</li>
                  <li style={{ marginBottom: "3px" }}>حصر اضرار زخات البرد على الهيكل</li>
                  <li style={{ marginBottom: "3px" }}>فحص سماكة الطلاء وأماكن الرش</li>
                  <li style={{ marginBottom: "3px" }}>تحديد الأماكن المحمية بعوازل خارجية</li>
                  <li>تحديد أماكن التبهيت الناتجة عن اشعة الشمس</li>
                </ul>
              </CardContent>
            </Collapse>
          </Card>

          {/* فحص الكمبيوتر  */}
          <Card dir="rtl" sx={{ width: 342 }}>
            <div className={style.card_header}>
              <h2>فحص الكمبيوتر</h2>
              {/* Price line  through*/}
              <h3
                style={{
                  textAlign: "center",
                  color: "#757575 !important",
                  fontSize: isSaleClicked[4].clicked ? "22px" : "48px",
                  textDecoration: isSaleClicked[4].clicked ? "line-through" : "none",
                  fontWeight: isSaleClicked[4].clicked ? "600" : "700",
                }}
              >
                {carModelData && isSaleClicked[4].clicked && carModelData?.[0].prices?.[4].price * (1).toFixed(2) + " ريال"}
              </h3>
            </div>

            <CardContent>
              {/* Sale Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: isSaleClicked[4].clicked ? "#7431fa" : "#757575",
                  fontWeight: "700",
                }}
              >
                {isSaleClicked[4].clicked && carModelData && carModelData?.[0].prices?.[4].price * (0.9).toFixed(2) + " ريال"}
              </Typography>

              {/* Price */}
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  color: "#757575",
                  fontSize: "48px",
                  fontWeight: "700",
                }}
              >
                {carModelData && !isSaleClicked[4].clicked && carModelData?.[0].prices?.[4].price * (1).toFixed(2) + " ريال"}
              </Typography>
            </CardContent>

            <CardActions disableSpacing>
              <ExpandMore expand={expandedId === 4} onClick={() => handleExpandClick(4)} aria-expanded={expandedId === 4} aria-label="show more">
                <ExpandMoreIcon />
              </ExpandMore>

              {/* Sale btn */}
              {/* <Tooltip title="10%" arrow>
                <IconButton
                  className={style.sale10Btn}
                  color={isSaleClicked[4].clicked ? "primary" : "#757575"}
                  onClick={() => handleClick(!isSaleClicked[4].clicked, 4)}
                >
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip> */}
            </CardActions>

            <Collapse in={expandedId === 4} timeout="auto" unmountOnExit>
              <CardContent sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  الأجزاء المشمولة في الفحص
                </Typography>

                <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                  <li style={{ marginBottom: "3px" }}>فحص حساسات المحرك </li>
                  <li style={{ marginBottom: "3px" }}>فحص إضاءة ومؤشرات الطبلون</li>
                  <li style={{ marginBottom: "3px" }}>فحص حساسات الجير</li>
                  <li style={{ marginBottom: "3px" }}>فحص حساسات المكابح (ABS)</li>
                  <li>فحص حساسات الوسائد الهوائية</li>
                </ul>
              </CardContent>
            </Collapse>
          </Card>
        </div>
      )}
    </div>
  );
}
