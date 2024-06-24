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
import useGetModelsApi from "../../API/useGetModelsApi";

export default function Dashboard() {
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
    setSelectedModelId(""); // Reset selected manufacturer ID
  }

  // useEffect(() => {
  //   if (selectedManufacturerId) {
  //     fetchModels(selectedManufacturerId);
  //   }
  // }, [selectedManufacturerId]);

  // Models logic
  const [selectedModelId, setSelectedModelId] = useState("");
  const {
    refetch: fetchModels,
    data: models,
    isPending: isGetModelsPending,
    isSuccess: isGetModelsSuccess,
    fetchStatus: modelsFetchStatus,
  } = useGetModelsApi(selectedManufacturerId);

  useEffect(() => {
    if (selectedManufacturerId) {
      fetchModels(selectedManufacturerId);
    }
  }, [selectedManufacturerId]);

  function handleModelChange(e) {
    const modelId = e.target.value;
    setSelectedModelId(modelId);
    // setSelectedYearId(""); // Reset selected manufacturer ID
  }

  // useEffect(() => {
  //   if (selectedModelId) {
  //     fetchYears(selectedModelId);
  //   }
  // }, [selectedModelId]);

  // Submit all Form
  const formRef = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const countriesFormValidate = formRef.current.reportValidity();
    if (!countriesFormValidate) return;
    // Submit data
    // mutate(selectedPostId);
  };

  return (
    <div className={style.container}>
      {countriesFetchStatus === "fetching" ||
        manufacturesFetchStatus === "fetching" ||
        (modelsFetchStatus === "fetching" && (
          <div className={style.progressContainer}>
            <LinearProgress />
          </div>
        ))}

      <h1>Dashboard</h1>
      {(isGetCountriesSuccess && countries?.length === 0) ||
        (isGetManufacturesSuccess && manufactures?.length === 0) ||
        (isGetModelsSuccess && models?.length === 0 && <p>No data to show.</p>)}

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
                    <em>No country to show.</em>
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
                      <em>No manufacturer to show.</em>
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

          {/* Start Models input */}
          {models && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Select"
                  helperText="Please select the model"
                  value={selectedModelId}
                  onChange={handleModelChange}
                  disabled={isGetModelsPending}
                >
                  {models === undefined && (
                    <MenuItem value="">
                      <em>Loading...</em>
                    </MenuItem>
                  )}

                  {models?.length === 0 && (
                    <MenuItem value="">
                      <em>No model to show.</em>
                    </MenuItem>
                  )}

                  {models !== undefined &&
                    models?.length !== 0 &&
                    models?.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.model_name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          )}
          {/* End Models input */}

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
