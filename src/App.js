import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./component/Login";
import Signup from "./component/Signup";
import ForgotPassword from "./component/ForgotPassword";
import Home from "./component/Home";
import ReportIncident from "./component/ReportIncident";
import IncidentDetails from "./component/IncidentDetails";
import LocationPicker from './component/LocationPicker';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/report-incident" element={
            <ProtectedRoute>
              <ReportIncident />
            </ProtectedRoute>
          } />
          <Route path="/incident-details" element={
            <ProtectedRoute>
              <IncidentDetails />
            </ProtectedRoute>
          } />
          <Route path="/location-picker" element={
            <ProtectedRoute>
              <LocationPicker />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
