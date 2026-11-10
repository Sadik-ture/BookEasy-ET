import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import Dashboard from "./pages/customer/Dashboard";

function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-500">Coming in the next steps.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/businesses" element={<Placeholder title="Explore Businesses" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<Placeholder title="About" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}