// Search.jsx

import style from "./Search.module.scss";
import { useNavigate } from "react-router-dom";
// MUI
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
// API
import useSearchModelByNameApi from "../../../API/useSearchModelByNameApi";

export default function Search() {
  const navigate = useNavigate();
  const { data: models, isSuccess } = useSearchModelByNameApi();

  const handleModelChange = (event, newValue) => {
    if (newValue) {
      navigate(`/dashboard/car/${newValue.id}`);
    }
  };

  return (
    <div className={style.container}>
      <Avatar
        sx={{
          margin: "auto",
          marginBottom: "0px",
          bgcolor: "transparent",
          color: "#757575",
          width: "100px",
          height: "100px",
        }}
      >
        <SearchIcon sx={{ fontSize: "75px" }} />
      </Avatar>

      <div className={style.box}>
        <Autocomplete
          sx={{ backgroundColor: "#fff" }}
          disablePortal
          onChange={handleModelChange}
          options={isSuccess ? models.carModels : []}
          getOptionLabel={(option) => option.model_name}
          renderInput={(params) => (
            <TextField
              {...params}
              dir="rtl"
              fullWidth
              placeholder="أدخل موديل السيارة"
              autoFocus
              inputProps={{
                ...params.inputProps,
                autoComplete: "off",
              }}
            />
          )}
          renderOption={(props, option) => (
            <li dir="rtl" {...props} key={option.id}>
              {option.model_name}
            </li>
          )}
          noOptionsText={
            <div dir="rtl" style={{ padding: "8px 16px", textAlign: "center" }}>
              {isSuccess ? "لا يوجد نتائج" : "جاري التحميل..."}
            </div>
          }
        />
      </div>
    </div>
  );
}
