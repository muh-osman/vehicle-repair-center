import style from "./EditPrices.module.scss";
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
import { useEditPricesApi } from "../../../API/useEditPricesApi";

export default function EditPrices() {
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

  // Get form data
  const [Rservice1, setRservice1] = useState("");
  const [Rservice2, setRservice2] = useState("");
  const [Rservice3, setRservice3] = useState("");
  const [Rservice4, setRservice4] = useState("");
  const [Rservice5, setRservice5] = useState("");

  const [Lservice1, setLservice1] = useState("");
  const [Lservice2, setLservice2] = useState("");
  const [Lservice3, setLservice3] = useState("");
  const [Lservice4, setLservice4] = useState("");
  const [Lservice5, setLservice5] = useState("");

  //  Submit form
  const pricesFormRef = useRef();
  const {
    mutate,
    isPending: isEditPricesPending,
    isSuccess: isEditPricesSuccess,
  } = useEditPricesApi();
  const handleSubmit = (e) => {
    e.preventDefault();
    // required input
    const validate = pricesFormRef.current.reportValidity();
    if (!validate) return;

    const data = {
      car_model_id: selectedModelId,
      years: [
        {
          year_id: "1",
          services: [
            {
              service_id: "1",
              price: Rservice1,
            },
            {
              service_id: "2",
              price: Rservice2,
            },
            {
              service_id: "3",
              price: Rservice3,
            },
            {
              service_id: "4",
              price: Rservice4,
            },
            {
              service_id: "5",
              price: Rservice5,
            },
          ],
        },
        {
          year_id: "2",
          services: [
            {
              service_id: "1",
              price: Lservice1,
            },
            {
              service_id: "2",
              price: Lservice2,
            },
            {
              service_id: "3",
              price: Lservice3,
            },
            {
              service_id: "4",
              price: Lservice4,
            },
            {
              service_id: "5",
              price: Lservice5,
            },
          ],
        },
      ],
    };

    mutate(data);
  };

  useEffect(() => {
    // Reset the form
    if (isEditPricesSuccess) {
      setSelectedModelId("");

      setRservice1("");
      setRservice2("");
      setRservice3("");
      setRservice4("");
      setRservice5("");

      setLservice1("");
      setLservice2("");
      setLservice3("");
      setLservice4("");
      setLservice5("");
    }
  }, [isEditPricesSuccess]);

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

      <h1>Edit Prices of the model.</h1>

      {/* Start Form  */}
      <Box
        onSubmit={handleSubmit}
        ref={pricesFormRef}
        component="form"
        noValidate
        sx={{ mt: 3 }}
      >
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
                disabled={isGetModelsPending || isEditPricesPending}
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
            {/* Left year */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  dir="rtl"
                  fullWidth
                  type="text"
                  label="Year"
                  value="سنة 2015 أو أعلى"
                  disabled={true}
                ></TextField>
              </Grid>
            </Grid>
            {/* Left Service 1 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="شامل"
                  label="شامل"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Lservice1}
                  onChange={(e) => setLservice1(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Left Service 2 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="أساسي"
                  label="أساسي"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Lservice2}
                  onChange={(e) => setLservice2(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Left Service 3 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="محركات"
                  label="محركات"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Lservice3}
                  onChange={(e) => setLservice3(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Left Service 4 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="هيكل خارجي"
                  label="هيكل خارجي"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Lservice4}
                  onChange={(e) => setLservice4(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Left Service 5 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="كمبيوتر"
                  label="كمبيوتر"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Lservice5}
                  onChange={(e) => setLservice5(e.target.value)}
                />
              </Grid>
            </Grid>
          </div>
          {/* End Left box */}

          {/* Start Right box */}
          <div className={style.right_box}>
            {/* Right year */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  dir="rtl"
                  fullWidth
                  type="text"
                  label="Year"
                  value="سنة 2014 أو أدنى"
                  disabled={true}
                ></TextField>
              </Grid>
            </Grid>
            {/* Right Service 1 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="شامل"
                  label="شامل"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Rservice1}
                  onChange={(e) => setRservice1(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Right Service 2 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="أساسي"
                  label="أساسي"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Rservice2}
                  onChange={(e) => setRservice2(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Right Service 3 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="محركات"
                  label="محركات"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Rservice3}
                  onChange={(e) => setRservice3(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Right Service 4 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="هيكل خارجي"
                  label="هيكل خارجي"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Rservice4}
                  onChange={(e) => setRservice4(e.target.value)}
                />
              </Grid>
            </Grid>
            {/* Right Service 5 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                    backgroundColor: "#fff",
                  }}
                  dir="rtl"
                  fullWidth
                  id="كمبيوتر"
                  label="كمبيوتر"
                  type="number"
                  required
                  disabled={isEditPricesPending}
                  value={Rservice5}
                  onChange={(e) => setRservice5(e.target.value)}
                />
              </Grid>
            </Grid>
          </div>
          {/* End Right box */}
        </div>

        {/* Start loading button for form 1 */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          disableRipple
          loading={isEditPricesPending}
          sx={{ mt: 3, mb: 2, transition: "0.1s" }}
        >
          Edit prices
        </LoadingButton>
        {/* End loading button for form 1 */}
      </Box>
      {/* End Form  */}
    </div>
  );
}
