import style from "./Search.module.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
// MUI
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
// API
import { useSearchModelByNameApi } from "../../../API/useSearchModelByNameApi";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timer, setTimer] = useState(null);

  const { mutate, data, isPending } = useSearchModelByNameApi();

  const handleInputChange = (e) => {
    setSearchQuery("");
    setSearchQuery(e.target.value);

    // Clear the previous timer
    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timer to delay the fetch by 1 second
    const newTimer = setTimeout(() => {
      if (e.target.value !== "") {
        mutate(e.target.value);
      }
    }, 0); // 1000 milliseconds = 1 second

    setTimer(newTimer);
  };

  return (
    <div className={style.container}>
      <h1>Search</h1>
      <div className={style.box}>
        <div>
          <TextField
            sx={{ backgroundColor: "#fff" }}
            dir="rtl"
            fullWidth
            id="search-bar"
            className="text"
            onInput={handleInputChange}
            type="text"
            variant="outlined"
            placeholder="ادخل موديل السيارة"
            autoFocus
            InputProps={{
              autoComplete: "off",
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => searchQuery && mutate(searchQuery)}
                  >
                    {isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SearchIcon size={24} style={{ fill: "#757575" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className={style.result_box} dir="rtl">
          {searchQuery &&
            data?.map((model) => (
              <Link to={`/dashboard/car/${model.id}`} key={model.id}>
                {model.model_name}
              </Link>
            ))}

          {data?.length === 0 && searchQuery && <div>لا يوجد نتائج</div>}
        </div>
      </div>
    </div>
  );
}
