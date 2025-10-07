// Updated: VerifyOtpPage.jsx (for /signup/verify-otp route)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css'; // Reuse styling

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { registrationNumber } = location.state || {}; // Passed from signup page
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Compute email from registrationNumber (matches backend generateEmail)
  const computeEmail = (regNo) => {
    if (!regNo) return '';
    return `${regNo.toLowerCase()}@cuiwah.edu.pk`;
  };

  const email = computeEmail(registrationNumber);

  // Redirect back if no registrationNumber
  useEffect(() => {
    if (!registrationNumber) {
      navigate('/signup');
    }
  }, [registrationNumber, navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Restrict to 6 digits
    if (value && !/^\d{0,6}$/.test(value)) return;
    setOtp(value);
    if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResendLoading(true);

    try {
      const payload = { registrationNumber };
      await axios.post('https://css-cui-wah.vercel.app/signup/auth/send-otp', payload);
      setOtpSent(true);
      setSuccess(`OTP sent to your email! Check ${email} (and spam folder).`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP';
      setErrors({ general: errorMsg });
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);

    try {
      const payload = { registrationNumber, otp };
      const response = await axios.post('https://css-cui-wah.vercel.app/signup/auth/verify-otp', payload);
      setSuccess(response.data.message || 'OTP verified! Registration complete.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP';
      setErrors({ otp: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="header">
        <div className="logo-section">
          <div className="logo">
            <img src="logo.png" alt="COMSATS Sports Society Logo" />
          </div>
          <div className="university-name">
            <h1>COMSATS UNIVERSITY</h1>
            <p>ISLAMABAD</p>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="left-section">
          <div className="welcome-board">
            <div>
              <h1 className="welcome-title">Verify Your<br />Email OTP</h1>
              <p className="welcome-subtitle">Enter the code sent to your email</p>
            </div>
          </div>
        </div>

        <div className="signup-section">
          <h2 className="form-title">OTP Verification</h2>
          <p className="regno-display">For: <strong>{registrationNumber}</strong></p>
          {email && <p className="email-display">Email: <strong>{email}</strong></p>}
          
          {success && <div className="success-message">{success}</div>}
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <button type="submit" className="signup-btn" disabled={resendLoading}>
                {resendLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.otp ? 'error' : ''}`}
                    placeholder="123456"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    disabled={loading}
                    required
                  />
                  {errors.otp && <span className="error-text">{errors.otp}</span>}
                </div>

                <button type="submit" className="signup-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="resend-link">
                Didn't receive? <button type="button" onClick={handleSendOtp} disabled={resendLoading || loading}>
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          <div className="login-link">
            <a href="/signup">Back to Signup</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .regno-display {
          text-align: center;
          margin-bottom: 10px;
          font-size: 1.1em;
          color: #555;
        }
        .email-display {
          text-align: center;
          margin-bottom: 20px;
          font-size: 1em;
          color: #666;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          border-left: 4px solid #007bff;
        }
        .resend-link {
          text-align: center;
          margin-top: 15px;
        }
        .resend-link button {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
        }
        .resend-link button:disabled {
          color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}s