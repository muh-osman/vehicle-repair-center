import { useState } from "react";
import style from "./AddShippingRequest.module.scss";
// MUI
import { Box, Grid, TextField, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio, Typography, Paper, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
// Image
import single from "../../../Assets/Images/single.png";
import multible from "../../../Assets/Images/multible.png";
// Toastify
import { toast } from "react-toastify";
// API
import { useAddSippingCarOrderApi } from "../../../API/useAddSippingCarOrderApi";
// JSON
import carData from "./data.json";

// Cities that exist as an "origin" (from) in data.json
const fromCities = [
  { id: 1, nameAr: "الرياض" },
  { id: 2, nameAr: "الدمام" },
  { id: 3, nameAr: "جدة" },
  { id: 4, nameAr: "القصيم" },
  { id: 5, nameAr: "خميس مشيط" },
];

// Full destination list (same as client Shippings page)
const toCities = [
  { id: 1, nameAr: "الرياض" },
  { id: 2, nameAr: "الدمام" },
  { id: 3, nameAr: "جدة" },
  { id: 4, nameAr: "ابها" },
  { id: 5, nameAr: "الطائف" },
  { id: 6, nameAr: "تبوك" },
  { id: 7, nameAr: "القريات" },
  { id: 8, nameAr: "مكة المكرمة" },
  { id: 9, nameAr: "المدينة المنورة" },
  { id: 10, nameAr: "جيزان" },
  { id: 11, nameAr: "نجران" },
  { id: 12, nameAr: "القصيم" },
  { id: 13, nameAr: "بيشة" },
  { id: 14, nameAr: "عرعر" },
  { id: 15, nameAr: "سكاكا الجوف" },
  { id: 16, nameAr: "حفر الباطن" },
  { id: 17, nameAr: "حائل" },
  { id: 18, nameAr: "الجبيل" },
  { id: 19, nameAr: "ينبع" },
  { id: 20, nameAr: "شرورة" },
  { id: 21, nameAr: "النماص" },
  { id: 22, nameAr: "الهفوف" },
  { id: 23, nameAr: "ضبا" },
  { id: 24, nameAr: "الباحة" },
  { id: 25, nameAr: "الخفجي" },
];

export default function AddShippingRequest() {
  // Manually typed fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  // Shipping fields
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [shippingType, setShippingType] = useState("");

  const { mutate, isPending } = useAddSippingCarOrderApi();

  // Same price calculation logic as the client pages
  function calculateShippingPrice(from, to, type) {
    if (!from || !to || !type) return null;

    const cityData = carData.from[from];
    if (!cityData) return null;

    return type === "نقل عام" ? cityData.public[to] : cityData.private[to];
  }

  const price = calculateShippingPrice(fromCity, toCity, shippingType);

  const handleFromCityChange = (e) => {
    setFromCity(e.target.value);
    setToCity("");
    setShippingType("");
  };

  const handleToCityChange = (e) => {
    setToCity(e.target.value);
    setShippingType("");
  };

  const isFormValid = name && phoneNumber && model && plateNumber && fromCity && toCity && shippingType;

  const handleSubmit = () => {
    if (!isFormValid) {
      toast.warn("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    const data = {
      payment_id: "N/A",
      name: name,
      reportNumber: "N/A",
      model: model,
      modelCategory: "ذهاب صاحب السيارة إلى شركة الشحن",
      plateNumber: plateNumber,
      from: fromCity,
      to: toCity,
      shippingType: shippingType,
      price: price,
      phoneNumber: phoneNumber,
      status: "الدفع عند الاستلام",
      isShipped: false,
      accountant_status: false,
    };

    mutate(data, {
      onSuccess: () => {
        // Reset form after successful creation
        setName("");
        setPhoneNumber("");
        setModel("");
        setPlateNumber("");
        setFromCity("");
        setToCity("");
        setShippingType("");
      },
    });
  };

  // Whether each shipping type is actually available for the selected route
  const publicAvailable = fromCity && toCity && calculateShippingPrice(fromCity, toCity, "نقل عام") !== 0 && calculateShippingPrice(fromCity, toCity, "نقل عام") != null;
  const privateAvailable = fromCity && toCity && calculateShippingPrice(fromCity, toCity, "سطحة خاصة") !== 0 && calculateShippingPrice(fromCity, toCity, "سطحة خاصة") != null;

  return (
    <div className={style.container} dir="rtl">
      <Paper elevation={2} sx={{ maxWidth: 600, margin: "24px auto", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {/* <LocalShippingIcon color="primary" /> */}
          <Typography variant="h6" fontWeight="bold">
            إنشاء طلب شحن جديد
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {/* Client info */}
          <Grid item xs={12} sm={6}>
            <TextField dir="rtl" label="اسم العميل" fullWidth value={name} onChange={(e) => setName(e.target.value)} required disabled={isPending} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              dir="ltr"
              type="tel"
              placeholder="05xxxxxxxx"
              label="رقم الجوال"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputProps={{ maxLength: 10, inputMode: "numeric" }}
              required
              disabled={isPending}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField dir="auto" label="موديل السيارة" fullWidth value={model} onChange={(e) => setModel(e.target.value)} required disabled={isPending} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField dir="ltr" label="رقم اللوحة" fullWidth value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required disabled={isPending} />
          </Grid>

          {/* Shipping route */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={isPending}>
              <InputLabel id="from-city-label">شحن من</InputLabel>
              <Select labelId="from-city-label" label="شحن من" value={fromCity} onChange={handleFromCityChange}>
                {fromCities.map((city) => (
                  <MenuItem key={city.id} value={city.nameAr}>
                    {city.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={!fromCity || isPending}>
              <InputLabel id="to-city-label">شحن الى</InputLabel>
              <Select labelId="to-city-label" label="شحن الى" value={toCity} onChange={handleToCityChange}>
                {toCities.map((city) => (
                  <MenuItem key={city.id} value={city.nameAr}>
                    {city.nameAr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Shipping type */}
          <Grid item xs={12}>
            <FormControl component="fieldset" disabled={!toCity || isPending} fullWidth>
              {publicAvailable && <Typography sx={{ mb: 1, fontWeight: "bold" }}>نوع الشحن</Typography>}
              <RadioGroup row value={shippingType} onChange={(e) => setShippingType(e.target.value)} sx={{ gap: 2, justifyContent: "center" }}>
                {publicAvailable && (
                  <Box
                    onClick={() => !isPending && setShippingType("نقل عام")}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: shippingType === "نقل عام" ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 1.5,
                      cursor: isPending ? "default" : "pointer",
                      minWidth: 110,
                      backgroundColor: shippingType === "نقل عام" ? "primary.50" : "transparent",
                    }}
                  >
                    <Box component="img" src={multible} alt="نقل عام" sx={{ width: 60, height: 60, objectFit: "contain" }} />
                    <FormControlLabel value="نقل عام" control={<Radio sx={{ display: "none" }} />} label="نقل عام" sx={{ m: 0 }} />
                  </Box>
                )}

                {privateAvailable && (
                  <Box
                    onClick={() => !isPending && setShippingType("سطحة خاصة")}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: shippingType === "سطحة خاصة" ? "primary.main" : "divider",
                      borderRadius: 2,
                      p: 1.5,
                      cursor: isPending ? "default" : "pointer",
                      minWidth: 110,
                      backgroundColor: shippingType === "سطحة خاصة" ? "primary.50" : "transparent",
                    }}
                  >
                    <Box component="img" src={single} alt="سطحة خاصة" sx={{ width: 60, height: 60, objectFit: "contain" }} />
                    <FormControlLabel value="سطحة خاصة" control={<Radio sx={{ display: "none" }} />} label="سطحة خاصة" sx={{ m: 0 }} />
                  </Box>
                )}
              </RadioGroup>
              {toCity && !publicAvailable && !privateAvailable && (
                <Typography color="error" variant="body2">
                  لا يوجد نوع شحن متاح لهذا المسار
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Price preview */}
          {price != null && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography fontWeight="bold">السعر</Typography>
                <Typography fontWeight="bold" fontSize="18px">
                  {price} ريال
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <LoadingButton fullWidth variant="contained" size="large" onClick={handleSubmit} loading={isPending} disabled={!isFormValid || isPending}>
              إنشاء الطلب
            </LoadingButton>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
