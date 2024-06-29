import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
// Pages & components
import Layout from "./Layout/Layout";
import HomeLayout from "./Layout/HomeLayout";
import Home from "./Pages/Home/Home";
import Blog from "./Pages/Blog/Blog";
import About from "./Pages/About/About";
import LogIn from "./Pages/LogIn/LogIn";
import SignUp from "./Pages/SignUp/SignUp";
import VerifyEmail from "./Pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Auth from "./Utils/Auth";
import SuperAuth from "./Utils/SuperAuth";
import NotAuth from "./Utils/NotAuth";
import DashboardLayout from "./Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Table from "./Pages/Dashboard/Table/Table";
import Post from "./Pages/Dashboard/Post/Post";

import Add from "./Pages/Dashboard/Add/Add";
import AddIndex from "./Pages/Dashboard/AddIndex/AddIndex";
import AddModel from "./Pages/Dashboard/AddModel/AddModel";
import AddPrices from "./Pages/Dashboard/AddPrices/AddPrices";
import AddManufacturer from "./Pages/Dashboard/AddManufacturer/AddManufacturer";

import Edit from "./Pages/Dashboard/Edit/Edit";
import EditIndex from "./Pages/Dashboard/EditIndex/EditIndex";
import EditModel from "./Pages/Dashboard/EditModel/EditModel";
import EditPrices from "./Pages/Dashboard/EditPrices/EditPrices";

import Delete from "./Pages/Dashboard/Delete/Delete";
import NotFound from "./Pages/NotFound/NotFound";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="about" element={<About />} />
        </Route>

        <Route element={<NotAuth />}>
          {/* Start Check if login */}
          <Route path="login" element={<LogIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          {/* End Check if login */}
        </Route>

        <Route element={<Auth />}>
          {/* Start protected route */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="table" element={<Table />} />
            <Route path="post/:id" element={<Post />} />

            {/* Super Admin only */}
            <Route element={<SuperAuth />}>
              <Route path="add" element={<Add />}>
                <Route index element={<AddIndex />} />
                <Route path="model" element={<AddModel />} />
                <Route path="prices" element={<AddPrices />} />
                <Route path="manufacturer" element={<AddManufacturer />} />
              </Route>

              <Route path="edit" element={<Edit />}>
                <Route index element={<EditIndex />} />
                <Route path="model" element={<EditModel />} />
                <Route path="prices" element={<EditPrices />} />
              </Route>
            </Route>
            {/* Super Admin only */}

            <Route path="delete" element={<Delete />} />
          </Route>
          {/* End protected route */}
        </Route>

        {/* http://localhost:3000/verify-email?expires=XXX&hash=XXX&id=XXX&signature=XXX */}
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}
