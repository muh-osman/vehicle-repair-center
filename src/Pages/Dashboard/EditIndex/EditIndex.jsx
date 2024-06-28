import style from "./EditIndex.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
// Mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function EditIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("prices", { replace: true });
  }, []);
  return (
    <>
      {/* <div className={style.container}>
        <h1>Edit the models or the prices.</h1>

        <Stack
          sx={{ mt: 6 }}
          spacing={2}
          direction="row"
          justifyContent="center"
        >
          <Link to={"model"}>
            <Button variant="contained">Edit model</Button>
          </Link>

          <Link to={"prices"}>
            <Button variant="outlined">Edit prices</Button>
          </Link>
        </Stack>
      </div> */}
    </>
  );
}
