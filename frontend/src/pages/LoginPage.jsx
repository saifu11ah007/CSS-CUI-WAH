import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import './gallery.css';

export default function LoginPage() {
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use direct path for local testing, adjust for Netlify
      const isLocal = window.location.hostname === 'localhost';
      window.location.href = isLocal ? '/Homepage/home.html';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!batch || !department || !number || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Validate 3-digit number
    if (!/^\d{3}$/.test(number)) {
      setError('Registration number must be a 3-digit number');
      return;
    }

    // Format registration number
    const registrationNumber = `${batch}-${department}-${number}`;

    setIsLoading(true);

    try {
      const response = await axios.post('https://css-cui-wah.vercel.app/login/auth/login', {
        registrationNumber,
        password
      });

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Clear form
      setBatch('');
      setDepartment('');
      setNumber('');
      setPassword('');

      // Redirect based on environment
      const isLocal = window.location.hostname === 'localhost';
      window.location.href = isLocal ? '/Homepage/home.html' : '/home';
    } catch (err) {
      setIsLoading(false);
      setPassword(''); // Clear password field on error
      setNumber(''); // Clear number field on error

      if (err.response) {
        setError(err.response.data.message || 'Invalid registration number or password');
      } else {
        setError('Server not reachable. Please try again later.');
      }
    }
  };

  const handleTabClick = (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
  };

  // Batch options (SP22 to FA25)
  const batchOptions = [
    'SP22', 'FA22', 'SP23', 'FA23', 'SP24', 'FA24', 'SP25', 'FA25'
  ];

  // Department options
  const departmentOptions = [
    'BSE', 'BCS', 'BBA', 'BEE', 'BME', 'BCE', 'CVE', 'BPY', 'BAF'
  ];

  return (
    <>
      <div className="header">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-circle">
              <div className="logo-inner">
                <img src="/image.png" alt="COMSATS Sports Society Logo" />
              </div>
            </div>
          </div>
          <div className="university-name">
            <h1>COMSATS SPORTS</h1>
            <p>SOCIETY</p>
          </div>
        </div>
        <button
          className="president-login-btn"
          onClick={() => alert('President Portal Login Coming Soon!')}
        >
          President Portal Login
        </button>
      </div>

      <div className="main-container">
        <div className="left-section">
          <div className="welcome-board">
            <div>
              <h1 className="welcome-title">
                Welcome to<br />COMSATS Sports Society<br /> Website
              </h1>
              <p className="welcome-subtitle">One Team, One Dream!</p>
            </div>
          </div>
          <div className="content-area">
            <div className="reel-container">
              <div className="reel-item">
                <video width="100%" height="600" controls autoplay loop muted>
                  <source src="/videos/reel1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="reel-item">
                <video width="100%" height="600" controls autoplay loop muted>
                  <source src="/videos/reel1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="login-form-container">
            <h2 className="form-title">Student Login</h2>
            <div id="loginForm">
              <div className="tab-buttons">
                <button type="button" className="tab-btn active" onClick={handleTabClick}>
                  By Roll No
                </button>
                <button type="button" className="tab-btn" onClick={handleTabClick}>
                  By List
                </button>
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <select
                  className="form-input"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="" disabled>Select Batch</option>
                  {batchOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <select
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="" disabled>Select Department</option>
                  {departmentOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="000"
                  className="form-input"
                  value={number}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,3}$/.test(value)) {
                      setNumber(value);
                    }
                  }}
                  style={{ flex: 1 }}
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="••••••••••"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                  {error}
                </div>
              )}



              <div className="form-links">
                <a href="#" className="forgot-link">Forgot Password ? Click Here!</a>
                <Link to="/signup" className="parent-link">Don't have an account? Sign Up</Link>              </div>

              <button
                type="submit"
                className="login-btn"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>

          <div className="events-section">
            <h2 className="events-header">Events</h2>
            <div className="coming-soon">
              <h3>🎊 Exciting Times Ahead!</h3>
              <p>We are coming up with exciting events very soon. Stay tuned for updates on tournaments, training camps, and special sports activities!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}