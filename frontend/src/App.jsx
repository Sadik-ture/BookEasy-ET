import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import OwnerGuard, { OnlyFor } from "./routes/OwnerGuard";
import Home from "./pages/public/Home";
import Explore from "./pages/public/Explore";
import BusinessDetail from "./pages/public/BusinessDetail";
import ScanTable from "./pages/public/ScanTable";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import Dashboard from "./pages/customer/Dashboard";
import MyBookings from "./pages/customer/MyBookings";
import MyOrders from "./pages/customer/MyOrders";
import CreateBusiness from "./pages/owner/CreateBusiness";
import Overview from "./pages/owner/Overview";
import ManageBookings from "./pages/owner/ManageBookings";
import ManageOrders from "./pages/owner/ManageOrders";
import ManageMenu from "./pages/owner/ManageMenu";
import ManageServices from "./pages/owner/ManageServices";
import ManageStaff from "./pages/owner/ManageStaff";
import ManageTables from "./pages/owner/ManageTables";
import ComingSoon from "./pages/common/ComingSoon";

export default function App() {
  return (
    <Routes>
      {/* Public pages with navbar + footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/businesses" element={<Explore />} />
        <Route path="/business/:slug" element={<BusinessDetail />} />
        <Route path="/t/:code" element={<ScanTable />} />
        <Route path="/about" element={<ComingSoon title="About" />} />
        <Route path="/contact" element={<ComingSoon title="Contact" />} />
        <Route path="*" element={<ComingSoon title="Page not found" message="That page doesn't exist." />} />
      </Route>

      {/* Full-screen auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer area */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/favorites" element={<ComingSoon title="Favorites" />} />
        <Route path="/profile" element={<ComingSoon title="Profile" />} />
        <Route path="/list-your-business" element={<CreateBusiness />} />
      </Route>

      {/* Business owner area */}
      <Route
        element={
          <ProtectedRoute>
            <OwnerGuard />
          </ProtectedRoute>
        }
      >
        <Route path="/manage" element={<Overview />} />
        <Route path="/manage/bookings" element={<OnlyFor restaurant={false}><ManageBookings /></OnlyFor>} />
        <Route path="/manage/services" element={<OnlyFor restaurant={false}><ManageServices /></OnlyFor>} />
        <Route path="/manage/staff" element={<OnlyFor restaurant={false}><ManageStaff /></OnlyFor>} />
        <Route path="/manage/orders" element={<OnlyFor restaurant><ManageOrders /></OnlyFor>} />
        <Route path="/manage/menu" element={<OnlyFor restaurant><ManageMenu /></OnlyFor>} />
        <Route path="/manage/tables" element={<OnlyFor restaurant><ManageTables /></OnlyFor>} />
      </Route>
    </Routes>
  );
}