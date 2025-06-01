import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./component/Login";
import Signup from "./component/Signup";
import ForgotPassword from "./component/ForgotPassword";
import Home from "./component/Home";
import ReportIncident from "./component/ReportIncident";
import IncidentDetails from "./component/IncidentDetails";
import LocationPicker from './component/LocationPicker';
import MyIncidents from './component/MyIncidents';
import DateRangePicker from './component/DateRangePicker';
import EmergencyContact from './component/EmergencyContact';
import BloodBank from './component/BloodBank';
import BloodBankList from './component/BloodBankList';

const ProtectedRoute = ({ children, allowSkip = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access if user is authenticated OR if coming from skip and allowSkip is true
  const isFromSkip = location.state?.fromSkip;
  if (isAuthenticated || (allowSkip && isFromSkip)) {
    return children;
  }

  return <Navigate to="/" />;
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
            <ProtectedRoute allowSkip={true}>
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
          <Route path="/incident-details/:id" element={
            <ProtectedRoute>
              <IncidentDetails />
            </ProtectedRoute>
          } />
          <Route path="/location-picker" element={
            <ProtectedRoute>
              <LocationPicker />
            </ProtectedRoute>
          } />
          <Route path="/my-incidents" element={
            <ProtectedRoute>
              <MyIncidents />
            </ProtectedRoute>
          } />
          <Route path="/date-range-picker" element={
            <ProtectedRoute>
              <DateRangePicker />
            </ProtectedRoute>
          } />
          <Route path="/emergency-contact" element={
            <ProtectedRoute allowSkip={true}>
              <EmergencyContact />
            </ProtectedRoute>
          } />
          <Route path="/blood-bank" element={
            <ProtectedRoute allowSkip={true}>
              <BloodBank />
            </ProtectedRoute>
          } />
          <Route path="/blood-bank-list" element={
            <ProtectedRoute allowSkip={true}>
              <BloodBankList />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
