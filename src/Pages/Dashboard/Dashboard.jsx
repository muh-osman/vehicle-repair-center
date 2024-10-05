// Dashboard.jsx
import style from "./Dashboard.module.scss";
// React
import { useEffect, useState } from "react";
// MUI
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

import IconButton from "@mui/material/IconButton";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
// API
import useGetCountriesApi from "../../API/useGetCountriesApi";
import useGetManufacturesApi from "../../API/useGetManufacturesApi";
import useGetModelsApi from "../../API/useGetModelsApi";
import useGetYearsApi from "../../API/useGetYearsApi";
import useGetServicesApi from "../../API/useGetServicesApi";
import useGetPriceApi from "../../API/useGetPriceApi";

const ITEM_HEIGHT = 68;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      direction: "rtl",
    },
  },
};

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
    setSelectedModelId(""); // Reset selected model ID
    setSelectedYearId(""); // Reset selected year ID
    setSelectedServicesId([]); // Reset selected service ID
    setPrice(""); // Reset the price
    setIsSaleClicked(false); // Reset sale 10% show
    setIsSale20Clicked(false); // Reset sale 20% show
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
    setSelectedModelId(""); // Reset selected model ID
    setSelectedYearId(""); // Reset selected year ID
    setSelectedServicesId([]); // Reset selected service ID
    setPrice(""); // Reset the price
    setIsSaleClicked(false); //Reset 10% sale show
    setIsSale20Clicked(false); // Reset sale 20% show
  }

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
    setSelectedYearId(""); // Reset selected year ID
    setSelectedServicesId([]); // Reset selected service ID
    setPrice(""); // Reset the price
    setIsSaleClicked(false); //Reset sale 10% show
    setIsSale20Clicked(false); // Reset sale 20% show
  }

  // Years logic
  const [selectedYearId, setSelectedYearId] = useState("");
  const {
    refetch: fetchYears,
    data: years,
    isPending: isGetYearsPending,
    isSuccess: isGetYearsSuccess,
    fetchStatus: yearsFetchStatus,
  } = useGetYearsApi(selectedModelId);

  useEffect(() => {
    if (selectedModelId) {
      fetchYears(selectedModelId);
    }
  }, [selectedModelId]);

  function handleYearChange(e) {
    const yearId = e.target.value;
    setSelectedYearId(yearId);
    setSelectedServicesId([]); // Reset selected service ID
    setPrice(""); // Reset the price
    setIsSaleClicked(false); //Reset sale 10% show
    setIsSale20Clicked(false); // Reset sale 20% show
  }

  // Services logic
  const [selectedServicesId, setSelectedServicesId] = useState([]);
  const {
    refetch: fetchServices,
    data: services,
    isPending: isGetServicesPending,
    isSuccess: isGetServicesSuccess,
    fetchStatus: servicesFetchStatus,
  } = useGetServicesApi(selectedYearId);

  useEffect(() => {
    if (selectedYearId) {
      fetchServices(selectedYearId);
    }
  }, [selectedYearId]);

  function handleServiceChange(e) {
    // const serviceId = e.target.value;
    // setSelectedServicesId(serviceId);

    const {
      target: { value },
    } = e;
    setSelectedServicesId(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );

    // console.log(selectedServicesId);
    // setPrice(""); // Reset the price
  }

  // Price logic
  const [price, setPrice] = useState("");
  const {
    refetch: fetchPrice,
    data: priceData,
    isPending: isGetPricePending,
    isSuccess: isGetPriceSuccess,
    fetchStatus: priceFetchStatus,
  } = useGetPriceApi(selectedModelId, selectedYearId, selectedServicesId);

  // useEffect(() => {
  //   if (selectedServicesId.length > 0) {
  //     // Check if selectedServicesId has changed
  //     fetchPrice(selectedModelId, selectedYearId, selectedServicesId);
  //   }
  //   setPrice(priceData);
  // }, [selectedServicesId]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedServicesId.length > 0) {
        // Check if selectedServicesId has changed
        await fetchPrice(selectedModelId, selectedYearId, selectedServicesId);
        setPrice(priceData);
      }
    };

    fetchData();
  }, [selectedServicesId]);

  // Sale
  const [isSaleClicked, setIsSaleClicked] = useState(false);
  const discountedPrice = priceData * 0.9; // 10% discount

  // Progress
  const progress = () => {
    if (
      countriesFetchStatus === "fetching" ||
      manufacturesFetchStatus === "fetching" ||
      modelsFetchStatus === "fetching" ||
      yearsFetchStatus === "fetching" ||
      servicesFetchStatus === "fetching" ||
      priceFetchStatus === "fetching"
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

  const [isSale20Clicked, setIsSale20Clicked] = useState(false);
  const discounted20Price = priceData * 0.8; // 20% discount

  const sale10 = () => {
    setIsSale20Clicked(false); // turn off 20% discount
    setIsSaleClicked((prevState) => !prevState); // turn on 10% discount
  };

  const sale20 = () => {
    setIsSaleClicked(false); // turn off 10% discount
    setIsSale20Clicked((prevState) => !prevState); // turn on 20% discount
  };

  return (
    <div className={style.container}>
      {progress()}

      {/* <h1>Dashboard</h1> */}

      {/* Start Form  */}
      <div className={style.container_box}>
        <Box
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
                  label="الشركة المصنعة"
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

          {/* Start Models input */}
          {models && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      <MenuItem dir="rtl" key={model.id} value={model.id}>
                        {model.model_name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          )}
          {/* End Models input */}

          {/* Start Years input */}
          {years && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  dir="rtl"
                  required
                  fullWidth
                  select
                  label="سنة الصنع"
                  value={selectedYearId}
                  onChange={handleYearChange}
                  disabled={isGetYearsPending}
                >
                  {years === undefined && (
                    <MenuItem value="">
                      <em>Loading...</em>
                    </MenuItem>
                  )}

                  {years?.length === 0 && (
                    <MenuItem value="">
                      <em>No years to show.</em>
                    </MenuItem>
                  )}

                  {years !== undefined &&
                    years?.length !== 0 &&
                    years?.map((year) => (
                      <MenuItem dir="rtl" key={year.id} value={year.id}>
                        {year.year}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          )}
          {/* End Years input */}

          {/* Start Services input */}
          {services && (
            <div>
              <FormControl
                sx={{ m: 0, width: "100%", backgroundColor: "#fff" }}
              >
                <InputLabel id="demo-multiple-checkbox-label">
                  الخدمات
                </InputLabel>
                <Select
                  dir="rtl"
                  required
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedServicesId}
                  onChange={handleServiceChange}
                  input={<OutlinedInput label="الخدمات" />}
                  renderValue={(selected) => {
                    return selected
                      .map(
                        (id) =>
                          services.find((service) => service.id === id)
                            ?.service_name
                      )
                      .filter(Boolean)
                      .join(", ");
                  }}
                  MenuProps={MenuProps}
                >
                  {services?.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Checkbox
                        checked={selectedServicesId.indexOf(service.id) > -1}
                      />
                      <ListItemText primary={service.service_name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          {/* End Services input */}

          {/* Start Price */}
          <div className={style.price_box}>
            {priceData && (
              <h1
                dir="rtl"
                style={{ color: "#757575" }}
                className={
                  isSaleClicked || isSale20Clicked ? "originalPrice" : ""
                }
              >
                {priceData} <span>ريال</span>
              </h1>
            )}
          </div>

          {/* Price after sale 10% */}
          {isSaleClicked && priceData && (
            <div className={style.price_box}>
              <h1 dir="rtl" style={{ color: "#7431fa" }}>
                {discountedPrice} <span>ريال</span>
              </h1>
            </div>
          )}

          {/* Price after sale 20% */}
          {isSale20Clicked && priceData && selectedServicesId.includes(1) && (
            <div className={style.price_box}>
              <h1 dir="rtl" style={{ color: "#d32f2f" }}>
                {discounted20Price} <span>ريال</span>
              </h1>
            </div>
          )}

          {/* Sale btn 10% */}
          {priceData && (
            <div className={style.saleBtn}>
              <Tooltip title="10%" arrow>
                <IconButton color="primary" onClick={sale10}>
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}

          {/* Sale btn 20% */}
          {priceData && selectedServicesId.includes(1) && (
            <div className={style.saleBtn_20}>
              <Tooltip title="20%" arrow>
                <IconButton color="error" onClick={sale20}>
                  <LoyaltyIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}

          {/* End Price */}
        </Box>
      </div>
      {/* End Form  */}
    </div>
  );
}
