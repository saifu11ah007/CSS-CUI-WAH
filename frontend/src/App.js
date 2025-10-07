import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage.jsx';
import VerifyOtpPage from './pages/VerifyOtp.jsx';
import './index.css';  // Or App.css
// Redirect logged-in users away from login/signup
const RedirectIfLoggedIn = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('authToken');
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>

         {/* <Route 
          path="/admin/dashboard" 
          element={
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          } 
        /> */}
        <Route path="/" element={<SignupPage />} />
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <SignupPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route path="/signup/verify-otp" element={<VerifyOtpPage />} />
        <Route
          path="/signup"
          element={
            <RedirectIfLoggedIn>
              <SignupPage />
            </RedirectIfLoggedIn>
          }
        />
        {/* <Route path="/otp" element={<OTP />} />
        <Route path="/signup/completion" element={<CompleteSignup />} /> */}
      </Routes>
    </Router>
  );
}

export default App; 