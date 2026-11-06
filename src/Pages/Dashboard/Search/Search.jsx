import * as React from "react";
import { useState, useEffect, useRef } from "react";
// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress } from "@mui/material";
// Toastify
import { toast } from "react-toastify";
// API
import useGetAllCarModelsApi from "../../../API/useGetAllCarModelsApi";
import useGetAllCarManufacturerApi from "../../../API/useGetAllCarManufacturerApi";
import useSearchModelByNameApi from "../../../API/useSearchModelByNameApi";
import style from "./Search.module.scss";

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

export default function Search() {
  const autoCompleteInputRef = useRef(null);

  const { data: models, isSuccess } = useGetAllCarModelsApi();
  const { data: AllManufacturer, isSuccess: isGetAllManufacturerSuccess } = useGetAllCarManufacturerApi();

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(null);

  // Only fetch results when both are selected
  const [submittedModelId, setSubmittedModelId] = useState(null);
  const [submittedYear, setSubmittedYear] = useState(null);

  const { data: serviceModels, isSuccess: isServicesSuccess, isFetching } = useSearchModelByNameApi(submittedYear, submittedModelId);

  const services = isServicesSuccess && serviceModels ? serviceModels.slice(0, 5) : [];

  const [expandedId, setExpandedId] = useState(-1);
  const [discountClicked, setDiscountClicked] = useState([]);

  const handleModelChange = (event, newValue) => {
    setSelectedModelId(newValue ? newValue.id : null);
    // Reset results when model changes
    setSubmittedModelId(null);
    setSubmittedYear(null);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    // Reset results when year changes
    setSubmittedModelId(null);
    setSubmittedYear(null);
  };

  const handleSubmit = () => {
    if (selectedModelId && selectedYear) {
      setSubmittedModelId(selectedModelId);
      setSubmittedYear(selectedYear);
      setExpandedId(-1);
      setDiscountClicked([]);
    } else {
      toast.warn("الرجاء ادخال جميع البيانات");
    }
  };

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
  }, [submittedYear]);

  const getDiscount = (service) => (service.serviceAr === "الفحص الشامل" ? 0.1 : 0.05);
  const getDiscountLabel = (service) => (service.serviceAr === "الفحص الشامل" ? "10%" : "5%");

  return (
    <div className={style.container}>
      {/* Search Box */}
      <div className={style.box}>
        <Typography
          variant="h6"
          component="div"
          style={{
            textAlign: "center",
            margin: "20px",
            marginTop: "8px",
            fontSize: "28px",
            fontWeight: "800",
            color: "#757575",
          }}
        >
          حدد نوع السيارة
        </Typography>

        <Autocomplete
          dir="rtl"
          sx={{ backgroundColor: "#fff" }}
          disablePortal
          onChange={(event, newValue) => {
            handleModelChange(event, newValue);
            if (autoCompleteInputRef.current) {
              autoCompleteInputRef.current.blur();
            }
          }}
          options={isSuccess ? models : []}
          getOptionLabel={(option) => {
            const manufacturer = AllManufacturer?.find((m) => m.id === option.carManufacturerId);
            const manufacturerName = manufacturer?.nameAr;
            return `${option.nameAr} - ${option.nameEn}${manufacturerName ? ` | ${manufacturerName}` : ""}`;
          }}
          renderInput={(params) => <TextField {...params} label="بحث" inputRef={autoCompleteInputRef} />}
          renderOption={(props, option) => {
            const manufacturer = AllManufacturer?.find((m) => m.id === option.carManufacturerId);
            const manufacturerName = manufacturer?.nameAr;
            return (
              <li dir="rtl" {...props} key={option.id}>
                <span>
                  {option.nameAr} - {option.nameEn}
                </span>
                {manufacturerName && <span style={{ marginRight: 8, marginLeft: 8, color: "#888", fontSize: "0.85em" }}>| {manufacturerName}</span>}
              </li>
            );
          }}
          filterOptions={(options, { inputValue }) => {
            const lower = inputValue.toLowerCase();
            return options.filter((option) => {
              const manufacturer = AllManufacturer?.find((m) => m.id === option.carManufacturerId);
              return (
                option.nameAr?.includes(inputValue) ||
                option.nameEn?.toLowerCase().includes(lower) ||
                manufacturer?.nameAr?.includes(inputValue) ||
                manufacturer?.nameEn?.toLowerCase().includes(lower)
              );
            });
          }}
          noOptionsText={
            isSuccess ? (
              <div dir="rtl" style={{ padding: "8px 16px", textAlign: "center" }}>
                موديل غير موجود
              </div>
            ) : (
              <div dir="rtl" style={{ padding: "8px 16px", textAlign: "center" }}>
                جاري التحميل..
              </div>
            )
          }
        />

        <Box dir="ltr" sx={{ width: "100%", margin: "auto", marginTop: "28px" }}>
          <FormControl dir="ltr" fullWidth>
            <InputLabel>سنة الصنع</InputLabel>
            <Select dir="ltr" value={selectedYear} label="سنة الصنع" onChange={handleYearChange} sx={{ backgroundColor: "#fff", direction: "ltr", textAlign: "left" }}>
              {Array.from({ length: 29 }, (_, i) => {
                const year = 2027 - i;
                return (
                  <MenuItem key={year} value={year} sx={{ direction: "ltr" }}>
                    {year === 1999 ? "أقدم" : year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        {/* Search button */}
        {selectedModelId && selectedYear && (
          <Box sx={{ marginTop: "32px", textAlign: "center" }}>
            {/* <IconButton size="large" onClick={handleSubmit} className={style.search_btn}>
              <SearchIcon sx={{ fontSize: "46px", color: "#174545" }} />
            </IconButton> */}

            <IconButton
              size="large"
              onClick={handleSubmit}
              disabled={isFetching} // Disable button while loading
              className={style.search_btn}
            >
              {isFetching ? (
                <CircularProgress size={46} /> // Show loading spinner
              ) : (
                <SearchIcon sx={{ fontSize: "46px", color: "#174545" }} />
              )}
            </IconButton>
          </Box>
        )}
      </div>

      {/* Results Section */}
      {(isFetching || (isServicesSuccess && submittedModelId)) && (
        <div style={{ marginTop: "32px", width: "100%" }}>
          {/* {isFetching && (
            <div style={{ marginBottom: "16px" }}>
              <LinearProgress />
            </div>
          )} */}

          {isServicesSuccess && services.length > 0 && (
            <div className={style.card_container}>
              {services.map((service, index) => {
                const isDiscounted = !!discountClicked[index];
                const discount = getDiscount(service);
                const discountedPrice = service.price > 0 ? Math.trunc(service.price * (1 - discount)) : 0;
                const isShamilDiscount = service.serviceAr === "الفحص الشامل";

                return (
                  <Card key={service.id} dir="rtl" sx={{ width: { xs: "100%", sm: 342 } }}>
                    <div className={style.card_header}>
                      <h2>{service.serviceAr}</h2>
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

                      {service.price > 0 && (
                        <Tooltip title={getDiscountLabel(service)} arrow>
                          <IconButton color={isDiscounted ? (isShamilDiscount ? "primary" : "error") : "default"} onClick={() => handleDiscountClick(index)}>
                            <LoyaltyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>

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

          {isServicesSuccess && services.length === 0 && !isFetching && (
            <Typography variant="h6" sx={{ textAlign: "center", color: "#757575", marginTop: 4 }}>
              لا توجد خدمات متاحة
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
