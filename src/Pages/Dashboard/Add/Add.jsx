import style from "./Add.module.scss";
import { Outlet } from "react-router-dom";

export default function Add() {
  return (
    <div className={style.container}>
      <Outlet />
    </div>
  );
}
