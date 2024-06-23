import { useEffect } from "react";

// React router
import { useNavigate, Outlet } from "react-router-dom";

function DrawerAppBar() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, []);

  return <Outlet />;
}

export default DrawerAppBar;
