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
import Search from "./Pages/Dashboard/Search/Search";
import Car from "./Pages/Dashboard/Car/Car";
import Table from "./Pages/Dashboard/Table/Table";
import Post from "./Pages/Dashboard/Post/Post";

import Add from "./Pages/Dashboard/Add/Add";
import AddIndex from "./Pages/Dashboard/AddIndex/AddIndex";
import AddModel from "./Pages/Dashboard/AddModel/AddModel";
import AddPrices from "./Pages/Dashboard/AddPrices/AddPrices";
import AddManufacturer from "./Pages/Dashboard/AddManufacturer/AddManufacturer";

import Edit from "./Pages/Dashboard/Edit/Edit";
import EditIndex from "./Pages/Dashboard/EditIndex/EditIndex";
import EditManufacturer from "./Pages/Dashboard/EditManufacturer/EditManufacturer";
import EditModel from "./Pages/Dashboard/EditModel/EditModel";
import EditPrices from "./Pages/Dashboard/EditPrices/EditPrices";

import Delete from "./Pages/Dashboard/Delete/Delete";
import NotFound from "./Pages/NotFound/NotFound";
import Scan from "./Pages/Dashboard/Scan/Scan";
import PaidClient from "./Pages/Dashboard/PaidClient/PaidClient";
import TamaraClient from "./Pages/Dashboard/TamaraClient/TamaraClient";
import TabbyClient from "./Pages/Dashboard/TabbyClient/TabbyClient";
import UnpaidClient from "./Pages/Dashboard/UnpaidClient/UnpaidClient";
import Requests from "./Pages/Dashboard/Requests/Requests";
import PhoneNumber from "./Pages/Dashboard/PhoneNumber/PhoneNumber";
import FalakPost from "./Pages/Dashboard/FalakPost/FalakPost";
import Reports from "./Pages/Dashboard/Reports/Reports";
import Videos from "./Pages/Dashboard/Videos/Videos";
import FreeOrder from "./Pages/Dashboard/FreeOrder/FreeOrder";
import FreeOrderResult from "./Pages/Dashboard/FreeOrderResult/FreeOrderResult";
import Analytics from "./Pages/Dashboard/Analytics/Analytics";
import FalakMedia from "./Pages/Dashboard/FalakMedia/FalakMedia";
import FalakVideo from "./Pages/Dashboard/FalakVideo/FalakVideo";

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
            <Route path="search" element={<Search />} />
            <Route path="car/:id" element={<Car />} />
            <Route path="table" element={<Table />} />
            <Route path="scan" element={<Scan />} />
            <Route path="paid-client/:id" element={<PaidClient />} />
            <Route path="tamara-client/:id" element={<TamaraClient />} />
            <Route path="tabby-client/:id" element={<TabbyClient />} />
            <Route path="unpaid-client/:id" element={<UnpaidClient />} />

            {/* <Route path="post/:id" element={<Post />} /> */}
            <Route path="reports" element={<Reports />} />
            <Route path="videos" element={<Videos />} />
            <Route
              path="free-order-result/:phoneNumber"
              element={<FreeOrderResult />}
            />

            {/* Super Admin only */}
            <Route element={<SuperAuth />}>
              <Route path="requests" element={<Requests />} />
              <Route path="phone-number" element={<PhoneNumber />} />
              <Route path="falak-media" element={<FalakMedia />} />
              <Route path="falak-post" element={<FalakPost />} />
              <Route path="falak-video" element={<FalakVideo />} />
              <Route path="free-order" element={<FreeOrder />} />
              <Route path="analytics" element={<Analytics />} />

              <Route path="add" element={<Add />}>
                <Route index element={<AddIndex />} />
                <Route path="model" element={<AddModel />} />
                <Route path="prices" element={<AddPrices />} />
                <Route path="manufacturer" element={<AddManufacturer />} />
              </Route>

              <Route path="edit" element={<Edit />}>
                <Route index element={<EditIndex />} />
                <Route path="manufacturer" element={<EditManufacturer />} />
                <Route path="model" element={<EditModel />} />
                <Route path="prices" element={<EditPrices />} />
              </Route>
              <Route path="delete" element={<Delete />} />
            </Route>
            {/* Super Admin only */}
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
