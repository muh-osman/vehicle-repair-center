import style from "./Add.module.scss";
import { useState, useEffect } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import LoadingButton from "@mui/lab/LoadingButton";
// API
import useGetCountriesApi from "../../../API/useGetCountriesApi";
import useGetManufacturesApi from "../../../API/useGetManufacturesApi";

export default function Add() {
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
    setSelectedManufacturerId(""); // Reset selected manufacturer ID
  }

  // Manufactures logic
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");
  const {
    refetch: fetchManufactures,
    data: manufactures,
    isPending: isGetManufacturesPending,
    isSuccess: isGetManufacturesSuccess,
    fetchStatus: manufacturesFetchStatus,
  } = useGetManufacturesApi(selectedCountryId);

  useEffect(() => {
    if (selectedCountryId) {
      fetchManufactures(selectedCountryId);
    }
  }, [selectedCountryId]);

  function handleManufacturerChange(e) {
    const manufacturerId = e.target.value;
    setSelectedManufacturerId(manufacturerId);
  }


  // Logic submit form one









  // Progress
  const progress = () => {
    if (
      countriesFetchStatus === "fetching" ||
      manufacturesFetchStatus === "fetching"
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

      <h1>Add new model</h1>

      {/* Start Form one */}

      <Box component="form" noValidate sx={{ mt: 3 }}>
        {/* Start Countries input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="rtl"
              required
              fullWidth
              select
              label="Country"
              value={selectedCountryId}
              onChange={handleCountriesChange}
              disabled={isGetCountriesPending}
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

        {/* Start Manufacturers input */}
        {manufactures && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                required
                fullWidth
                select
                label="Manufacturer"
                value={selectedManufacturerId}
                onChange={handleManufacturerChange}
                disabled={isGetManufacturesPending}
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
        )}
        {/* End Manufacturers input */}

        {/* Start new model input */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ backgroundColor: "#fff" }}
              dir="rtl"
              fullWidth
              id="Model"
              label="Model"
              type="text"
              name="model_name"
              required
              disabled={false}
            />
          </Grid>
        </Grid>
        {/* End new model input */}

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={true}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          Add
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
      {/* End Form one */}
    </div>
  );
}
