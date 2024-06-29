import style from "./EditIndex.module.scss";
import { Link, useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// Mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function EditIndex() {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   navigate("prices", { replace: true });
  // }, []);

  return (
    <div className={style.container}>
      <h1>Edit the manufacturers, models or the prices.</h1>

      <Stack
        sx={{ mt: 6 }}
        spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="14px"
      >
        <Link to={"manufacturer"}>
          <Button variant="outlined">تعديل الشركة المصنعة</Button>
        </Link>

        <Link to={"model"}>
          <Button variant="outlined">تعديل الموديل</Button>
        </Link>

        <Link to={"prices"}>
          <Button variant="contained">تعديل الأسعار</Button>
        </Link>
      </Stack>
    </div>
  );
}
