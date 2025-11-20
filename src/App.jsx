import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Segments from "./pages/Segments";
import Campaigns from "./pages/Campaigns";
import CustomerDirectory from "./pages/CustomerDirectory";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";

const App = () => {
  return (
    <Router>
      <ToastProvider />
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute><Customers /></ProtectedRoute>}
        />
        <Route
          path="/customers/:id"
          element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>}
        />
        <Route
          path="/segments"
          element={<ProtectedRoute><Segments /></ProtectedRoute>}
        />
        <Route
          path="/campaigns"
          element={<ProtectedRoute><Campaigns /></ProtectedRoute>}
        />
        <Route
          path="/customer-directory"
          element={<ProtectedRoute><CustomerDirectory /></ProtectedRoute>}
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
