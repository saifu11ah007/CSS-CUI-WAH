import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

export default function LoginPage() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!registrationNumber.trim() || !password.trim()) {
      setError('Please fill in both registration number and password');
      return;
    }

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
      setRegistrationNumber('');
      setPassword('');
      
      // Redirect to home
      navigate('/home');
    } catch (err) {
      setIsLoading(false);
      setPassword(''); // Clear password field on error
      
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

  return (
    <>
      <div className="header">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-circle">
              <div className="logo-inner">
                <img src="image.png" alt="" />
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
              <p className="welcome-subtitle">Tag Line, Tag Line!</p>
            </div>
          </div>
          <div className="content-area">
            <div className="info-grid">
              <div className="info-card">
                <h3>🏏 Cricket Tournament 2024</h3>
                <p>Join our annual inter-department cricket championship. Registration opens next month!</p>
              </div>
              <div className="info-card">
                <h3>⚽ Football League</h3>
                <p>The most anticipated event of the year. Teams battle for glory on the field every semester.</p>
              </div>
              <div className="info-card">
                <h3>🏐 Volleyball Championship</h3>
                <p>Fast-paced action and team spirit. Sign up your squad for the upcoming tournament!</p>
              </div>
              <div className="info-card">
                <h3>🏃 Athletics Meet</h3>
                <p>Track and field events showcasing speed, strength, and endurance. All students welcome!</p>
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
              
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="CIIT/FA00-BBB-000/WAH" 
                  className="form-input" 
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="FA23-BSE-007" 
                  className="form-input" 
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
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
                <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                  {error}
                </div>
              )}
              
              <div className="captcha-box">
                <div className="captcha-placeholder">
                  <input type="checkbox" id="captcha" />
                  <label htmlFor="captcha">I'm not a robot</label>
                </div>
              </div>
              
              <div className="form-links">
                <a href="#" className="forgot-link">Forgot Password ? Click Here!</a>
                <a href="#" className="parent-link">For Parent Console</a>
              </div>
              
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