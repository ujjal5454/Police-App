import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
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
import Hospital from './component/Hospital';
import FireBrigade from './component/FireBrigade';
import Ambulance from './component/Ambulance';
import Police from './component/Police';
import News from './component/News';
import NewsDetail from './component/NewsDetail';
import AdminNews from './component/AdminNews';
import Notice from './component/Notice';
import NoticeDetail from './component/NoticeDetail';
import AdminNotice from './component/AdminNotice';
import Settings from './component/Settings';
import ChangePassword from './component/ChangePassword';
import EditProfile from './component/EditProfile';
import PublicEye from './component/PublicEye';
import Feedback from './component/Feedback';
import UserGuide from './component/UserGuide';
import FAQ from './component/FAQ';
import FM from './component/FM';
import EComplaint from './component/EComplaint';

const ProtectedRoute = ({ children, allowSkip = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access if user is authenticated OR if allowSkip is true
  if (isAuthenticated || allowSkip) {
    return children;
  }

  return <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
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

          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
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
          <Route path="/hospital" element={
            <ProtectedRoute allowSkip={true}>
              <Hospital />
            </ProtectedRoute>
          } />
          <Route path="/fire-brigade" element={
            <ProtectedRoute allowSkip={true}>
              <FireBrigade />
            </ProtectedRoute>
          } />
          <Route path="/ambulance" element={
            <ProtectedRoute allowSkip={true}>
              <Ambulance />
            </ProtectedRoute>
          } />
          <Route path="/police" element={
            <ProtectedRoute allowSkip={true}>
              <Police />
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute allowSkip={true}>
              <News />
            </ProtectedRoute>
          } />
          <Route path="/news/:id" element={
            <ProtectedRoute allowSkip={true}>
              <NewsDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/news" element={
            <ProtectedRoute>
              <AdminNews />
            </ProtectedRoute>
          } />
          <Route path="/notice" element={
            <ProtectedRoute allowSkip={true}>
              <Notice />
            </ProtectedRoute>
          } />
          <Route path="/notice/:id" element={
            <ProtectedRoute allowSkip={true}>
              <NoticeDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/notices" element={
            <ProtectedRoute>
              <AdminNotice />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowSkip={true}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/public-eye" element={
            <ProtectedRoute allowSkip={true}>
              <PublicEye />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute allowSkip={true}>
              <Feedback />
            </ProtectedRoute>
          } />
          <Route path="/user-guide" element={
            <ProtectedRoute allowSkip={true}>
              <UserGuide />
            </ProtectedRoute>
          } />
          <Route path="/faq" element={
            <ProtectedRoute allowSkip={true}>
              <FAQ />
            </ProtectedRoute>
          } />
          <Route path="/fm" element={
            <ProtectedRoute allowSkip={true}>
              <FM />
            </ProtectedRoute>
          } />
          <Route path="/e-complaint" element={
            <ProtectedRoute allowSkip={true}>
              <EComplaint />
            </ProtectedRoute>
          } />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
