import style from "./EditManufacturer.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
// API
import useGetAllmanufacturesInDatabaseApi from "../../../API/useGetAllmanufacturesInDatabaseApi";
import useGetCountriesApi from "../../../API/useGetCountriesApi";
import { useEditManufacturerApi } from "../../../API/useEditManufacturerApi";

export default function EditManufacturer() {
  // All Manufacturer input logic
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");
  const {
    data: manufactures,
    isPending: isGetAllManufacturesPending,
    isSuccess: isGetAllManufacturesSuccess,
    fetchStatus: allManufacturesFetchStatus,
  } = useGetAllmanufacturesInDatabaseApi();

  function handleManufacturerChange(e) {
    const manufacturerId = e.target.value;
    setSelectedManufacturerId(manufacturerId);
  }

  // Enter new Manufacture name input logic
  const [newManufactureName, setNewManufactureName] = useState("");

  // All Countries logic
  const {
    data: countries,
    isSuccess: isGetAllCountriesSuccess,
    isPending: isGetAllCountriesPending,
    fetchStatus: allCountriesFetchStatus,
  } = useGetCountriesApi();

  const [selectedCountryId, setSelectedCountryId] = useState("");

  function handleCountriesChange(e) {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);
  }

  //  Submit form
  const editManufacturerFormRef = useRef();
  const {
    mutate,
    isPending: isEditManufacturerPending,
    isSuccess: isEditManufacturerSuccess,
  } = useEditManufacturerApi();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const validate = editManufacturerFormRef.current.reportValidity();
    if (!validate) return;

    const data = {
      manufactureId: selectedManufacturerId,
      manufacture_name: newManufactureName,
      country_id: selectedCountryId,
    };

    mutate(data);
  };

  useEffect(() => {
    if (isEditManufacturerSuccess) {
      setSelectedManufacturerId("");
      setNewManufactureName("");
      setSelectedCountryId("");
    }
  }, [isEditManufacturerSuccess]);

  // Progress
  const progress = () => {
    if (
      allManufacturesFetchStatus === "fetching" ||
      allCountriesFetchStatus === "fetching"
    ) {
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

      <h1 dir="rtl">حدد الشركة المصنعة لتحريرها.</h1>

      {/* Start Form */}
      <Box
        onSubmit={handleSubmit}
        ref={editManufacturerFormRef}
        component="form"
        noValidate
        sx={{
          mt: 3,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Start Manufacturers input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
              disabled={
                isGetAllManufacturesPending || isEditManufacturerPending
              }
            >
              {manufactures === undefined && (
                <MenuItem value="">
                  <em>Loading...</em>
                </MenuItem>
              )}

              {manufactures?.length === 0 && (
                <MenuItem value="">
                  <em>No manufacturer to show.</em>
                </MenuItem>
              )}

              {manufactures !== undefined &&
                manufactures?.length !== 0 &&
                manufactures?.map((manufacturer) => (
                  <MenuItem
                    dir="rtl"
                    key={manufacturer.id}
                    value={manufacturer.id}
                  >
                    {manufacturer.manufacture_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
        {/* End Manufacturers input */}

        {/* Start edit name of Manufacturers input */}
        {selectedManufacturerId && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                fullWidth
                label="اسم الشركة المصنعة الجديد"
                type="text"
                required
                disabled={isEditManufacturerPending}
                value={newManufactureName}
                onChange={(e) => setNewManufactureName(e.target.value)}
              />
            </Grid>
          </Grid>
        )}
        {/* Start edit name of Manufacturers input */}

        {/* Start Countries input */}
        {selectedManufacturerId && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                required
                fullWidth
                select
                label="الدولة الجديدة"
                value={selectedCountryId}
                onChange={handleCountriesChange}
                disabled={isGetAllCountriesPending || isEditManufacturerPending}
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
        )}
        {/* End Countries input */}

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isEditManufacturerPending}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          تعديل الشركة المصنعة
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
    </div>
  );
}
