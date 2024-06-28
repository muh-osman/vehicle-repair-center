import style from "./Edit.module.scss";
import { Outlet } from "react-router-dom";

export default function Edit() {
  return (
    <div className={style.container}>
      <Outlet />
    </div>
  );
}
