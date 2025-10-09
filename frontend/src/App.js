import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage.jsx';
import VerifyOtpPage from './pages/VerifyOtp.jsx';
import LoginPage from './pages/LoginPage.jsx';
import './index.css';

// Redirect logged-in users away from login/signup, and non-logged-in users to login
const RedirectIfLoggedIn = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? <Navigate to="/abc" replace /> : children;
};

// Redirect non-logged-in users from root to login
const RootRedirect = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? <Navigate to="/homepage/home" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupPage />
          }
        />
        <Route path="/signup/verify-otp" element={<VerifyOtpPage />} />
        {/* Placeholder for /abc route after login */}
      </Routes>
    </Router>
  );
}

export default App;