import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadDocument from "./pages/UploadDocument";
import MyDocuments from "./pages/MyDocuments";
import VerifyDocument from "./pages/VerifyDocument";
import SharedDocuments from "./pages/SharedDocuments";
import VerificationHistory from "./pages/VerificationHistory";
import AdminDashboard from "./pages/AdminDashboard";
import { clearAuth, getStoredUser, setAuth } from "./api/api";

function App() {
  const [user, setUser] = useState(getStoredUser());
  const navigate = useNavigate();

  const handleAuth = ({ token, user: authenticatedUser }) => {
    setAuth(token, authenticatedUser);
    setUser(authenticatedUser);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <main className={user ? "app-shell" : "auth-shell"}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="/register" element={<Register onAuth={handleAuth} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute user={user} roles={["USER", "ADMIN"]}>
                <UploadDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute user={user} roles={["USER", "ADMIN"]}>
                <MyDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <ProtectedRoute user={user}>
                <SharedDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <ProtectedRoute user={user}>
                <VerifyDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute user={user}>
                <VerificationHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
