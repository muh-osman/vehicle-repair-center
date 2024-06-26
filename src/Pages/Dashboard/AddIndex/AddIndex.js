import style from "./AddIndex.module.scss";
import { Link } from "react-router-dom";
// Mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function AddIndex() {
  return (
    <div className={style.container}>
      <h1>Create a new model then add it's prices.</h1>

      <Stack sx={{ mt: 6 }} spacing={2} direction="row" justifyContent="center">
        <Link to={"model"}>
          <Button variant="contained">Add model</Button>
        </Link>

        <Link to={"prices"}>
          <Button variant="outlined">Add prices</Button>
        </Link>
      </Stack>
    </div>
  );
}
