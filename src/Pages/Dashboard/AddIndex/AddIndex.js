import style from "./AddIndex.module.scss";
import { Link, useNavigate } from "react-router-dom";
// Mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useEffect } from "react";

export default function AddIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("model", { replace: true });
  }, []);
  return (
    <>
      {/* <div className={style.container}>
        <h1>Create a new model then add it's prices.</h1>

        <Stack
          sx={{ mt: 6 }}
          spacing={2}
          direction="row"
          justifyContent="center"
        >
          <Link to={"model"}>
            <Button variant="contained">اضافة موديل جديد</Button>
          </Link>

          <Link to={"prices"}>
            <Button variant="outlined">اضافة الأسعار</Button>
          </Link>
        </Stack>
      </div> */}
    </>
  );
}
