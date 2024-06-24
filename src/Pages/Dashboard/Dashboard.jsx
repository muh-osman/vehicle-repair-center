// Dashboard.jsx
import style from "./Dashboard.module.scss";
// React router
import { Link } from "react-router-dom";
// React
import { useEffect, useRef, useState } from "react";
// MUI
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import LinearProgress from "@mui/material/LinearProgress";
// Toastify
import { toast } from "react-toastify";
// API
import useGetCountriesApi from "../../API/useGetCountriesApi";
import useGetManufacturesApi from "../../API/useGetManufacturesApi";

export default function Dashboard() {
  // Countries logic
  const {
    data: countries,
    isSuccess: isGetCountriesSuccess,
    isPending: isGetCountriesPending,
    fetchStatus: countriesFetchStatus,
    isError: countriesIsError,
    error: countriesError,
  } = useGetCountriesApi();

  const formRef = useRef();
  const [selectedCountryId, setSelectedCountryId] = useState("");

  function handleCountriesChange(e) {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);
  }

  // Manufactures logic
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");
  const {
    refetch: fetchManufactures,
    data: manufactures,
    isPending: isGetManufacturesPending,
    isSuccess: isGetManufacturesSuccess,
    isError: manufacturesIsError,
    error: manufacturesError,
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
    // getModels(manufacturerId);
  }

  useEffect(() => {
    if (selectedManufacturerId) {
      // fetchModels(selectedManufacturerId);
    }
  }, [selectedManufacturerId]);

  // Submit all Form
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const countriesFormValidate = formRef.current.reportValidity();
    if (!countriesFormValidate) return;
    // Submit data
    // mutate(selectedPostId);
  };

  // Error handling
  useEffect(() => {
    // Countries
    if (countriesIsError) {
      console.error(countriesError);
      const errorMessage =
        countriesError?.response?.data?.message ||
        countriesError?.message ||
        "An error occurred";
      toast.error(errorMessage);
    }
    // Manufactures
    if (manufacturesIsError) {
      console.error(manufacturesError);
      const errorMessage =
        manufacturesError?.response?.data?.message ||
        manufacturesError?.message ||
        "An error occurred";
      toast.error(errorMessage);
    }
  }, [countriesError]);

  return (
    <div className={style.container}>
      {countriesFetchStatus === "fetching" ||
        (manufacturesFetchStatus === "fetching" && (
          <div className={style.progressContainer}>
            <LinearProgress />
          </div>
        ))}

      <h1>Dashboard</h1>
      {(isGetCountriesSuccess && countries?.length === 0) ||
        (isGetManufacturesSuccess && manufactures?.length === 0 && (
          <p>No data to show.</p>
        ))}

      {/* Start Form  */}
      <div className={style.container_box}>
        <Box
          ref={formRef}
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ mt: 3 }}
        >
          {/* Start Countries input */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Select"
                helperText="Please select the country"
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
                    <em>No post to delete.</em>
                  </MenuItem>
                )}

                {countries !== undefined &&
                  countries?.length !== 0 &&
                  countries.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
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
                  required
                  fullWidth
                  select
                  label="Select"
                  helperText="Please select the manufacturer"
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
                      <em>No post to delete.</em>
                    </MenuItem>
                  )}

                  {manufactures !== undefined &&
                    manufactures?.length !== 0 &&
                    manufactures?.map((manufacturer) => (
                      <MenuItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.manufacture_name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          )}
          {/* End Manufacturers input */}

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            disableRipple
            loading={false} // Need Change
            disabled={true} // Need Change
            sx={{ mt: 3, mb: 2, transition: "0.1s" }}
          >
            Search
          </LoadingButton>
        </Box>
      </div>
      {/* End Form  */}
    </div>
  );
}
