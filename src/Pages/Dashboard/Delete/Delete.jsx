import style from "./Delete.module.scss";
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
import { useDeleteModelApi } from "../../../API/useDeleteModelApi";

export default function Delete() {
  // Selec Model to delete logic
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

  //  Submit form
  const deleteModelFormRef = useRef();
  const {
    mutate,
    isPending: isDeleteModelPending,
    isSuccess: isDeleteModelSuccess,
  } = useDeleteModelApi();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const validate = deleteModelFormRef.current.reportValidity();
    if (!validate) return;

    mutate(selectedModelId);
  };

  useEffect(() => {
    if (isDeleteModelSuccess) {
      setSelectedModelId("");
    }
  }, [isDeleteModelSuccess]);

  // Progress
  const progress = () => {
    if (modelsFetchStatus === "fetching") {
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

      <h1 dir="rtl">حدد الموديل المراد حذفه.</h1>

      {/* Start Form */}
      <Box
        onSubmit={handleSubmit}
        ref={deleteModelFormRef}
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
              disabled={isGetModelsPending || isDeleteModelPending}
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

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isDeleteModelPending}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          حذف
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
    </div>
  );
}
