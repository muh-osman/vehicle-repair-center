import style from "./EditModel.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
// API
import useGetAllModelsInDatabaseApi from "../../../API/useGetAllModelsInDatabaseApi";
import useGetAllmanufacturesInDatabaseApi from "../../../API/useGetAllmanufacturesInDatabaseApi";
import { useEditModelApi } from "../../../API/useEditModelApi";

export default function EditModel() {
  // Selec Model to edit logic
  const [selectedModelId, setSelectedModelId] = useState("");

  const {
    data: models,
    isPending: isGetModelsPending,
    isSuccess: isGetModelsSuccess,
    fetchStatus: modelsFetchStatus,
  } = useGetAllModelsInDatabaseApi();

  function handleModelChange(e) {
    const modelId = e.target.value;
    setSelectedModelId(modelId);
    // console.log(selectedModelId);
  }

  // Enter new Model name input logic
  const [carModel, setCarModel] = useState("");

  // All Manufacturer input logic
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");
  const {
    data: manufactures,
    isPending: isGetManufacturesPending,
    isSuccess: isGetManufacturesSuccess,
    fetchStatus: manufacturesFetchStatus,
  } = useGetAllmanufacturesInDatabaseApi();

  function handleManufacturerChange(e) {
    const manufacturerId = e.target.value;
    setSelectedManufacturerId(manufacturerId);
  }

  //  Submit form
  const editModelFormRef = useRef();
  const {
    mutate,
    isPending: isEditModelPending,
    isSuccess: isEditModelSuccess,
  } = useEditModelApi();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const validate = editModelFormRef.current.reportValidity();
    if (!validate) return;

    const data = {
      maodelId: selectedModelId,
      model_name: carModel,
      manufacturer_id: selectedManufacturerId,
    };

    mutate(data);
  };

  useEffect(() => {
    if (isEditModelSuccess) {
      setSelectedModelId("");
      setCarModel("");
      setSelectedManufacturerId("");
    }
  }, [isEditModelSuccess]);

  // Progress
  const progress = () => {
    if (
      modelsFetchStatus === "fetching" ||
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

      <h1 dir="rtl">حدد الموديل لتحريره.</h1>

      {/* Start Form */}
      <Box
        onSubmit={handleSubmit}
        ref={editModelFormRef}
        component="form"
        noValidate
        sx={{
          mt: 3,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Start Models input */}
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
              disabled={isGetModelsPending || isEditModelPending}
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
        {/* End Models input */}

        {/* Start edit name of model input */}
        {selectedModelId && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                fullWidth
                label="الاسم الجديد"
                type="text"
                required
                disabled={isEditModelPending}
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
            </Grid>
          </Grid>
        )}
        {/* End edit name of model input */}

        {/* Start Manufacturers input */}
        {selectedModelId && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                sx={{ backgroundColor: "#fff" }}
                dir="rtl"
                required
                fullWidth
                select
                label="المصنع الجديد"
                value={selectedManufacturerId}
                onChange={handleManufacturerChange}
                disabled={isGetManufacturesPending || isEditModelPending}
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

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isEditModelPending}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          تعديل الموديل
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
      {/* End Form one */}
    </div>
  );
}
