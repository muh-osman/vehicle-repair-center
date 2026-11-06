import style from "./Car.module.scss";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
// API
import useSearchModelByNameApi from "../../../API/useSearchModelByNameApi";

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
  // const { modelId, year } = useParams();

  const { modelId, year: paramYear } = useParams();
  const [selectedYear, setSelectedYear] = useState(Number(paramYear));

  const { data: models, isSuccess, isFetching } = useSearchModelByNameApi(selectedYear, modelId);

  const [expandedId, setExpandedId] = useState(-1);
  const [discountClicked, setDiscountClicked] = useState([]);

  const handleExpandClick = (i) => {
    setExpandedId((prevId) => (prevId === i ? -1 : i));
  };

  const handleDiscountClick = (index) => {
    setDiscountClicked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  useEffect(() => {
    setDiscountClicked([]);
  }, [selectedYear]);

  // Take only first 5 services
  const services = isSuccess && models ? models.slice(0, 5) : [];

  // الفحص الشامل gets 10% discount, rest get 5%
  const getDiscount = (service) => {
    return service.serviceAr === "الفحص الشامل" ? 0.1 : 0.05;
  };

  const getDiscountLabel = (service) => {
    return service.serviceAr === "الفحص الشامل" ? "10%" : "5%";
  };

  return (
    <div className={style.container}>
      {/* Progress */}
      {isFetching && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      {/* Car info chips */}
      {isSuccess && services.length > 0 && (
        <div style={{ padding: "16px 0px 24px" }}>
          <Stack direction="row-reverse" spacing={1} justifyContent="center" alignItems="center">
            <Chip label={`${services[0].carMarkEn} - ${services[0].carMarkAr}`} />

            {/* Year toggle buttons */}
            <Chip
              dir="rtl"
              variant={selectedYear >= 2017 ? "filled" : "outlined"}
              color={selectedYear >= 2017 ? "primary" : "default"}
              label="2017 أو أعلى"
              onClick={() => setSelectedYear(2017)}
              clickable
            />
            <Chip
              dir="rtl"
              variant={selectedYear < 2017 ? "filled" : "outlined"}
              color={selectedYear < 2017 ? "primary" : "default"}
              label="2016 أو أدنى"
              onClick={() => setSelectedYear(2016)}
              clickable
            />
          </Stack>
        </div>
      )}

      {/* Cards grid */}
      {isSuccess && services.length > 0 && (
        <div className={style.card_container}>
          {services.map((service, index) => {
            const isDiscounted = !!discountClicked[index];
            const discount = getDiscount(service);
            const discountedPrice = service.price > 0 ? Math.trunc(service.price * (1 - discount)) : 0;
            const isShamilDiscount = service.serviceAr === "الفحص الشامل";

            return (
              <Card
                key={service.id}
                dir="rtl"
                sx={{
                  width: { xs: "100%", sm: 342 },
                }}
              >
                {/* Card Header */}
                <div className={style.card_header}>
                  <h2>{service.serviceAr}</h2>

                  {/* Strikethrough original price when discounted */}
                  {isDiscounted && service.price > 0 && (
                    <h3
                      style={{
                        textAlign: "center",
                        fontSize: "22px",
                        textDecoration: "line-through",
                        fontWeight: "600",
                        color: "#757575",
                        margin: 0,
                      }}
                    >
                      {service.price.toLocaleString()} ريال
                    </h3>
                  )}
                </div>

                <CardContent>
                  {/* Discounted price */}
                  {isDiscounted && service.price > 0 && (
                    <Typography
                      variant="h3"
                      sx={{
                        textAlign: "center",
                        color: isShamilDiscount ? "#7431fa" : "#d32f2f",
                        fontSize: "48px",
                        fontWeight: "700",
                      }}
                    >
                      {discountedPrice.toLocaleString()} ريال
                    </Typography>
                  )}

                  {/* Original price (shown when not discounted, or price is 0) */}
                  {(!isDiscounted || service.price === 0) && (
                    <Typography
                      variant="h3"
                      sx={{
                        textAlign: "center",
                        color: "#757575",
                        fontSize: "48px",
                        fontWeight: "700",
                      }}
                    >
                      {service.price > 0 ? `${service.price.toLocaleString()} ريال` : "-"}
                    </Typography>
                  )}
                </CardContent>

                <CardActions disableSpacing>
                  <ExpandMore expand={expandedId === index} onClick={() => handleExpandClick(index)} aria-expanded={expandedId === index} aria-label="show more">
                    <ExpandMoreIcon />
                  </ExpandMore>

                  {/* Discount button — only shown if service has a price */}
                  {service.price > 0 && (
                    <Tooltip title={getDiscountLabel(service)} arrow>
                      <IconButton color={isDiscounted ? (isShamilDiscount ? "primary" : "error") : "default"} onClick={() => handleDiscountClick(index)}>
                        <LoyaltyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>

                {/* Expanded stages list */}
                <Collapse in={expandedId === index} timeout="auto" unmountOnExit>
                  <CardContent sx={{ padding: "16px" }}>
                    <Typography variant="h6" gutterBottom>
                      الأجزاء المشمولة في الفحص
                    </Typography>
                    <ul style={{ listStylePosition: "inside", color: "#757575" }}>
                      {service.stages
                        .slice()
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((stage) => (
                          <li key={stage.id} style={{ marginBottom: "3px" }}>
                            {stage.nameAr}
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {isSuccess && services.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#757575", marginTop: 8 }}>
          لا توجد خدمات متاحة
        </Typography>
      )}
    </div>
  );
}
