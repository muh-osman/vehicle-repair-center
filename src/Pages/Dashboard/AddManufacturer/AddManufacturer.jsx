import style from "./AddManufacturer.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
// API
import useGetCountriesApi from "../../../API/useGetCountriesApi";
import { useAddManufacturerApi } from "../../../API/useAddManufacturerApi";
// Toastify
import { toast } from "react-toastify";

export default function AddManufacturer() {
  // Countries logic
  const {
    data: countries,
    isSuccess: isGetCountriesSuccess,
    isPending: isGetCountriesPending,
    fetchStatus: countriesFetchStatus,
  } = useGetCountriesApi();

  const [selectedCountryId, setSelectedCountryId] = useState("");

  function handleCountriesChange(e) {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);
  }

  // Manufacturer input logic
  const [carManufacturer, setCarManufacturer] = useState("");

  //  Submit form
  const manufacturerFormRef = useRef();
  const {
    mutate,
    isPending: isAddManufacturerPending,
    isSuccess: isAddManufacturerSuccess,
  } = useAddManufacturerApi();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const validate = manufacturerFormRef.current.reportValidity();
    if (!validate) return;
    const data = {
      manufacture_name: carManufacturer,
      country_id: selectedCountryId,
    };
    // Submit data
    mutate(data);
  };

  // useEffect(() => {
  //   if (isAddManufacturerSuccess) {
  //     setSelectedCountryId("");
  //     setCarManufacturer("");
  //   }
  // }, [isAddManufacturerSuccess]);

  // Progress
  const progress = () => {
    if (countriesFetchStatus === "fetching") {
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

      <h1>Add a new manufacturer.</h1>

      {/* Start Form */}
      <Box
        onSubmit={handleSubmit}
        ref={manufacturerFormRef}
        component="form"
        noValidate
        sx={{
          mt: 3,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Start Countries input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="rtl"
              required
              fullWidth
              select
              label="الدولة"
              value={selectedCountryId}
              onChange={handleCountriesChange}
              disabled={
                isGetCountriesPending ||
                isAddManufacturerPending ||
                isAddManufacturerSuccess
              }
            >
              {countries === undefined && (
                <MenuItem value="">
                  <em>Loading...</em>
                </MenuItem>
              )}

              {countries?.length === 0 && (
                <MenuItem value="">
                  <em>No country to show.</em>
                </MenuItem>
              )}

              {countries !== undefined &&
                countries?.length !== 0 &&
                countries.map((country) => (
                  <MenuItem dir="rtl" key={country.id} value={country.id}>
                    {country.country_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
        {/* End Countries input */}

        {/* Start new Manufacturer input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="rtl"
              fullWidth
              id="الشركة المصنعة"
              label="الشركة المصنعة"
              type="text"
              name="manufacturer_name"
              required
              disabled={isAddManufacturerPending || isAddManufacturerSuccess}
              value={carManufacturer}
              onChange={(e) => setCarManufacturer(e.target.value)}
            />
          </Grid>
        </Grid>
        {/* End new Manufacturer input */}

        {/* Start loading button for form */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isAddManufacturerPending}
          disabled={isAddManufacturerSuccess}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          اضافة شركة
        </LoadingButton>
        {/* End loading button for form */}
      </Box>
      {/* End Form one */}
    </div>
  );
}
