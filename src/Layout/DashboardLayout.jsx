import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";

import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
// Image logo
import logo from "../Assets/Images/logo.png";
// MUI icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import TocIcon from "@mui/icons-material/Toc";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeIcon from "@mui/icons-material/QrCode";
import DialpadIcon from "@mui/icons-material/Dialpad";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import PostAddIcon from "@mui/icons-material/PostAdd";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VideocamIcon from "@mui/icons-material/Videocam";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
// React router
import { Link, useLocation, Outlet, NavLink } from "react-router-dom";
// Cookies
import { useCookies } from "react-cookie";
// API
import { useLogoutApi } from "../API/useLogoutApi";
// Toastify
import { toast } from "react-toastify";
import CustomToast from "../Components/CustomToast ";

const drawerWidth = 240;

function ResponsiveDrawer(props) {
  // Cookie
  const [cookies, setCookie] = useCookies(["token", "verified", "role"]);

  const pages = [
    {
      id: 1,
      title: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon sx={{ color: "#757575" }} />,
    },
    {
      id: 2,
      title: "Search",
      path: "/dashboard/search",
      icon: <SearchIcon sx={{ color: "#757575" }} />,
    },
    {
      id: 3,
      title: "Table",
      path: "/dashboard/table",
      icon: <TocIcon sx={{ color: "#757575" }} />,
    },
  ];

  // Super Admin page
  if (cookies.role === 255) {
    pages.push(
      {
        id: 4,
        title: "Add",
        path: "/dashboard/add",
        icon: <AddBoxIcon sx={{ color: "#757575" }} />,
      },
      {
        id: 5,
        title: "Edit",
        path: "/dashboard/edit",
        icon: <AutoFixHighIcon sx={{ color: "#757575" }} />,
      },
      {
        id: 6,
        title: "Delete",
        path: "/dashboard/delete",
        icon: <DeleteIcon sx={{ color: "#757575" }} />,
      }
    );
  }

  const { pathname } = useLocation();

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar style={{ justifyContent: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              alt="Logo"
              src={logo}
              sx={{
                width: 50,
                height: 50,
                textAlign: "center",
                borderRadius: 0,
              }}
            />
          </Stack>
        </Link>
      </Toolbar>
      <Divider />

      <List>
        {pages.map((item) => {
          return (
            <ListItem
              dir="ltr"
              key={item.id}
              disablePadding
              button
              component={Link}
              to={item.path}
              // selected={item.path === pathname}
              selected={
                item.path !== "/dashboard"
                  ? pathname.includes(item.path)
                  : pathname === item.path
              }
            >
              <ListItemButton sx={{ color: "#757575" }}>
                <ListItemIcon>
                  <Avatar
                    alt="icon"
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "transparent",
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider />
        <ListItem
          dir="ltr"
          key={9999999}
          disablePadding
          button
          component={NavLink}
          to="/dashboard/scan"
          selected={pathname === "/dashboard/scan"}
        >
          <ListItemButton sx={{ color: "#757575" }}>
            <ListItemIcon>
              <Avatar
                alt="icon"
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "transparent",
                }}
              >
                <QrCodeIcon sx={{ color: "#757575" }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Scan QR" />
          </ListItemButton>
        </ListItem>

        {cookies.role === 255 && (
          <>
            <ListItem
              dir="ltr"
              key={99999999999999}
              disablePadding
              button
              component={NavLink}
              to="/dashboard/requests"
              selected={pathname === "/dashboard/requests"}
            >
              <ListItemButton sx={{ color: "#757575" }}>
                <ListItemIcon>
                  <Avatar
                    alt="icon"
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "transparent",
                    }}
                  >
                    <LocalGroceryStoreIcon sx={{ color: "#757575" }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Requests" />
              </ListItemButton>
            </ListItem>

            <Divider />

            <ListItem
              dir="ltr"
              key={888888888888}
              disablePadding
              button
              component={NavLink}
              to="/dashboard/phone-number"
              selected={pathname === "/dashboard/phone-number"}
            >
              <ListItemButton sx={{ color: "#757575" }}>
                <ListItemIcon>
                  <Avatar
                    alt="icon"
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "transparent",
                    }}
                  >
                    <DialpadIcon sx={{ color: "#757575" }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Falak Phone" />
              </ListItemButton>
            </ListItem>

            <ListItem
              dir="ltr"
              key={77777777}
              disablePadding
              button
              component={NavLink}
              to="/dashboard/falak-post"
              selected={pathname === "/dashboard/falak-post"}
            >
              <ListItemButton sx={{ color: "#757575" }}>
                <ListItemIcon>
                  <Avatar
                    alt="icon"
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "transparent",
                    }}
                  >
                    <PostAddIcon sx={{ color: "#757575" }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Falak Post" />
              </ListItemButton>
            </ListItem>

            <ListItem
              dir="ltr"
              key={777111}
              disablePadding
              button
              component={NavLink}
              to="/dashboard/free-order"
              selected={pathname === "/dashboard/free-order"}
            >
              <ListItemButton sx={{ color: "#757575" }}>
                <ListItemIcon>
                  <Avatar
                    alt="icon"
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "transparent",
                    }}
                  >
                    <LoyaltyIcon sx={{ color: "#757575" }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Free Order" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        <Divider />

        <ListItem
          dir="ltr"
          key={666666}
          disablePadding
          button
          component={NavLink}
          to="/dashboard/reports"
          selected={pathname === "/dashboard/reports"}
        >
          <ListItemButton sx={{ color: "#757575" }}>
            <ListItemIcon>
              <Avatar
                alt="icon"
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "transparent",
                }}
              >
                <InsertDriveFileIcon sx={{ color: "#757575" }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Mojaz" />
          </ListItemButton>
        </ListItem>

        <ListItem
          dir="ltr"
          key={7777}
          disablePadding
          button
          component={NavLink}
          to="/dashboard/videos"
          selected={pathname === "/dashboard/videos"}
        >
          <ListItemButton sx={{ color: "#757575" }}>
            <ListItemIcon>
              <Avatar
                alt="icon"
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "transparent",
                }}
              >
                <VideocamIcon sx={{ color: "#757575" }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Videos" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  // Check verification
  const notify = () => toast.warn(<CustomToast />);
  // React.useEffect(() => {
  //   if (cookies.token && !cookies.verified) {
  //     const verifyNotification = setTimeout(notify, 5000);

  //     return () => clearTimeout(verifyNotification);
  //   }
  // }, [cookies.token, cookies.verified]);

  // Logout
  const { mutate, isPending } = useLogoutApi();
  const logout = () => {
    mutate();
  };

  return (
    <Box sx={{ display: "flex" }} dir="ltr">
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <div className="nav_link" style={{ marginLeft: "auto" }}>
            <LoadingButton
              onClick={logout}
              variant="contained"
              disableRipple
              loading={isPending}
              loadingIndicator={
                <CircularProgress sx={{ color: "#fbfbfb" }} size={24} />
              } // Customize the loader color here
              sx={{
                backgroundColor: "#fbfbfb",
                color: "#7431fa",
                border: "1px solid #fbfbfb",
                transition: "0.1s",
                "&:hover": {
                  backgroundColor: "#7431fa",
                  color: "#fbfbfb",
                },
              }}
            >
              Logout
            </LoadingButton>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#fbfbfb",
          position: "relative",
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default React.memo(ResponsiveDrawer);
