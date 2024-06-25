import style from "./Prices.module.scss";
import { useState, useEffect, useRef } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
// Cookies
import { useCookies } from "react-cookie";
// API
import useGetAllModelsInDatabaseApi from "../../../API/useGetAllModelsInDatabaseApi";

export default function Prices() {
  // Models logic
  const [cookies, setCookie] = useCookies(["newModelId"]);

  const [selectedModelId, setSelectedModelId] = useState(
    cookies.newModelId ? cookies.newModelId : ""
  );

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

  //
  const formData = {
    car_model_id: selectedModelId,
    years: [
      {
        year_id: "1",
        services: [
          {
            service_id: "1",
            price: "",
          },
          {
            service_id: "2",
            price: "",
          },
          {
            service_id: "3",
            price: "",
          },
          {
            service_id: "4",
            price: "",
          },
          {
            service_id: "5",
            price: "",
          },
        ],
      },
      {
        year_id: "2",
        services: [
          {
            service_id: "1",
            price: "",
          },
          {
            service_id: "2",
            price: "",
          },
          {
            service_id: "3",
            price: "",
          },
          {
            service_id: "4",
            price: "",
          },
          {
            service_id: "5",
            price: "",
          },
        ],
      },
    ],
  };

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

      <h1>Add Prices of the model</h1>

      {/* Start Form  */}
      <Box component="form" noValidate sx={{ mt: 3 }}>
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
                label="Model"
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

        <div className={style.RL_boxs_container}>
          {/* Start Left box */}
          <div className={style.left_box}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  dir="rtl"
                  fullWidth
                  type="text"
                  label="Year"
                  value="سنة 2015 أو أعلى"
                  disabled={true}
                ></TextField>
              </Grid>
            </Grid>
          </div>
          {/* End Left box */}

          {/* Start Right box */}

          <div className={style.right_box}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{ backgroundColor: "#fff" }}
                  dir="rtl"
                  fullWidth
                  type="text"
                  label="Year"
                  value="سنة 2014 أو أدنى"
                  disabled={true}
                ></TextField>
              </Grid>
            </Grid>
          </div>

          {/* End Right box */}
        </div>
      </Box>
      {/* End Form  */}
    </div>
  );
}
