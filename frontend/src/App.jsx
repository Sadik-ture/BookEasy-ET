import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/public/Home";
import Explore from "./pages/public/Explore";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import Dashboard from "./pages/customer/Dashboard";
import ComingSoon from "./pages/common/ComingSoon";

export default function App() {
  return (
    <Routes>
      {/* Public pages with navbar + footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/businesses" element={<Explore />} />
        <Route
          path="/business/:slug"
          element={<ComingSoon title="Business details" message="The business page with services, menu and booking is coming in Step 4." />}
        />
        <Route path="/about" element={<ComingSoon title="About" />} />
        <Route path="/contact" element={<ComingSoon title="Contact" />} />
        <Route path="*" element={<ComingSoon title="Page not found" message="That page doesn't exist." />} />
      </Route>

      {/* Full-screen auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Signed-in area with the sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-bookings" element={<ComingSoon title="My Bookings" message="Coming in Step 4." />} />
        <Route path="/my-orders" element={<ComingSoon title="My Orders" message="Coming in Step 5." />} />
        <Route path="/favorites" element={<ComingSoon title="Favorites" />} />
        <Route path="/profile" element={<ComingSoon title="Profile" />} />
      </Route>
    </Routes>
  );
}