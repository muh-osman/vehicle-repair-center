import style from "./Dashboard.module.scss";
import { useEffect, useState, useMemo } from "react";

// MUI
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import LoyaltyIcon from "@mui/icons-material/Loyalty";

// API
import useGetAllCarManufacturerApi from "../../API/useGetAllCarManufacturerApi";
import useGetAllCarModelsApi from "../../API/useGetAllCarModelsApi";
import useSearchModelByNameApi from "../../API/useSearchModelByNameApi";

const YEAR_OPTIONS = [
  { id: "old", label: "2016 أو أدنى" },
  { id: "new", label: "2017 أو أعلى" },
];

export default function Dashboard() {
  // serviceId 8 = "الفحص الشامل" → 10% discount; all others → 5%
  const FULL_INSPECTION_SERVICE_ID = 8;
  // --- Data fetching ---
  const { data: manufacturers, isFetching: isManufacturersFetching } = useGetAllCarManufacturerApi();

  const { data: allModels, isSuccess: isModelsSuccess } = useGetAllCarModelsApi();

  // --- Selection state ---
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); // "old" | "new"
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // Map year option to numeric year for the API
  const yearParam = useMemo(() => {
    if (selectedYear === "old") return 2016;
    if (selectedYear === "new") return 2017;
    return null;
  }, [selectedYear]);

  // --- Price/services search ---
  const {
    data: priceServices,
    isSuccess: isPriceServicesSuccess,
    isFetching: isPriceServicesFetching,
    refetch: fetchPriceServices,
  } = useSearchModelByNameApi(yearParam, selectedModelId);

  // Fetch whenever model + year are both selected
  useEffect(() => {
    if (selectedModelId && yearParam) {
      fetchPriceServices();
    }
  }, [selectedModelId, yearParam]);

  // Reset downstream selections when a parent changes
  function handleManufacturerChange(e) {
    setSelectedManufacturerId(e.target.value);
    setSelectedModelId("");
    setSelectedYear("");
    setSelectedServiceId("");
  }

  function handleModelChange(e) {
    setSelectedModelId(e.target.value);
    setSelectedYear("");
    setSelectedServiceId("");
  }

  function handleYearChange(e) {
    setSelectedYear(e.target.value);
    setSelectedServiceId("");
  }

  // After selectedServiceId state, add:
  const [isSaleClicked, setIsSaleClicked] = useState(false);
  const [isSale5Clicked, setIsSale5Clicked] = useState(false);

  // Reset sale state in handleServiceChange:
  function handleServiceChange(e) {
    setSelectedServiceId(e.target.value);
    setIsSaleClicked(false);
    setIsSale5Clicked(false);
  }

  // --- Derived data ---

  // Models filtered by selected manufacturer
  const filteredModels = useMemo(() => {
    if (!allModels || !selectedManufacturerId) return [];
    return allModels.filter((m) => String(m.carManufacturerId) === String(selectedManufacturerId));
  }, [allModels, selectedManufacturerId]);

  // Selected price entry
  const selectedPriceEntry = useMemo(() => {
    if (!priceServices || !selectedServiceId) return null;
    return priceServices.find((p) => String(p.serviceId) === String(selectedServiceId)) ?? null;
  }, [priceServices, selectedServiceId]);

  const price = selectedPriceEntry?.price ?? null;

  // Loading indicator
  const isLoading = isManufacturersFetching || isPriceServicesFetching;

  //
  // Discount values
  const discountedPrice10 = price ? Math.trunc(price * 0.9) : null;
  const discountedPrice5 = price ? Math.trunc(price * 0.95) : null;

  const isFullInspection = selectedPriceEntry?.serviceId === FULL_INSPECTION_SERVICE_ID;

  function handleSaleToggle() {
    if (isFullInspection) {
      setIsSale5Clicked(false);
      setIsSaleClicked((p) => !p);
    } else {
      setIsSaleClicked(false);
      setIsSale5Clicked((p) => !p);
    }
  }

  return (
    <div className={style.container}>
      {isLoading && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <div className={style.container_box}>
        <Box
          component="div"
          sx={{
            mt: 3,
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Grid container spacing={3}>
            {/* 1. Manufacturer */}
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                required
                fullWidth
                select
                label="الشركة المصنعة"
                value={selectedManufacturerId}
                onChange={handleManufacturerChange}
                disabled={isManufacturersFetching}
              >
                {!manufacturers && (
                  <MenuItem value="">
                    <em>Loading...</em>
                  </MenuItem>
                )}
                {manufacturers?.length === 0 && (
                  <MenuItem value="">
                    <em>لا توجد بيانات</em>
                  </MenuItem>
                )}
                {manufacturers?.map((mfr) => (
                  <MenuItem dir="rtl" key={mfr.id} value={mfr.id}>
                    {`${mfr.nameAr} - ${mfr.nameEn}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* 2. Model — shown once a manufacturer is picked */}
            {selectedManufacturerId && (
              <Grid item xs={12}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  dir="rtl"
                  required
                  fullWidth
                  select
                  label="الموديل"
                  value={selectedModelId}
                  onChange={handleModelChange}
                  disabled={!isModelsSuccess}
                >
                  {filteredModels.length === 0 && (
                    <MenuItem value="">
                      <em>لا توجد موديلات</em>
                    </MenuItem>
                  )}
                  {filteredModels.map((model) => (
                    <MenuItem dir="rtl" key={model.id} value={model.id}>
                      {`${model.nameAr} - ${model.nameEn}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* 3. Year — shown once a model is picked */}
            {selectedModelId && (
              <Grid item xs={12}>
                <TextField sx={{ backgroundColor: "#fff" }} dir="rtl" required fullWidth select label="سنة الصنع" value={selectedYear} onChange={handleYearChange}>
                  {YEAR_OPTIONS.map((opt) => (
                    <MenuItem dir="rtl" key={opt.id} value={opt.id}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* 4. Service — shown once year is picked and data has loaded */}
            {selectedYear && isPriceServicesSuccess && priceServices?.length > 0 && (
              <Grid item xs={12}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  dir="rtl"
                  required
                  fullWidth
                  select
                  label="الخدمة"
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                  disabled={isPriceServicesFetching}
                >
                  {priceServices.map((svc) => (
                    <MenuItem dir="rtl" key={svc.serviceId} value={svc.serviceId}>
                      {svc.serviceAr}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* No services available message */}
            {selectedYear && isPriceServicesSuccess && (!priceServices || priceServices.length === 0) && (
              <Grid item xs={12}>
                <TextField sx={{ backgroundColor: "#fff" }} dir="rtl" fullWidth select label="الخدمة" value="" disabled>
                  <MenuItem value="">
                    <em>لا توجد خدمات متاحة</em>
                  </MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>

          {/* Price display */}
          {price !== null && (
            <div className={style.price_box}>
              <h1
                dir="rtl"
                style={{
                  color: "#757575",
                  textDecoration: isSaleClicked || isSale5Clicked ? "line-through" : "none",
                  fontSize: isSaleClicked || isSale5Clicked ? "1.6rem" : undefined,
                }}
              >
                {price} <span>ريال</span>
              </h1>

              {/* Discounted price — 10% for full inspection */}
              {isSaleClicked && (
                <h1 dir="rtl" style={{ color: "#7431fa" }}>
                  {discountedPrice10} <span>ريال</span>
                </h1>
              )}

              {/* Discounted price — 5% for other services */}
              {isSale5Clicked && (
                <h1 dir="rtl" style={{ color: "#d32f2f" }}>
                  {discountedPrice5} <span>ريال</span>
                </h1>
              )}

              {/* Single discount button — label changes by service */}
              <div className={style.saleBtn}>
                <Tooltip title={isFullInspection ? "خصم 10%" : "خصم 5%"} arrow>
                  <IconButton color={isFullInspection ? "primary" : "error"} onClick={handleSaleToggle}>
                    <LoyaltyIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
}
