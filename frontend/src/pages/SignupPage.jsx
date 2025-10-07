// Updated SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css'; // Assuming the CSS from the provided file is reusable

// Mock auth hook - replace with your actual auth context/hook
const useAuth = () => {
  // Simulate isLoggedIn from context
  const [isLoggedIn] = useState(false); // Replace with actual logic
  return { isLoggedIn };
};

export default function SignupPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registrationNumber: '', // Will be computed dynamically
    name: '',
    gender: '',
    department: '',
    program: '',
    password: '',
    verificationMethod: 'OTP', // Default to OTP
  });

  // Separate state for registration number components
  const [regBatch, setRegBatch] = useState('FA');
  const [regYear, setRegYear] = useState('');
  const [regProgram, setRegProgram] = useState('');
  const [regNumber, setRegNumber] = useState('');

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);

  // Updated department to program mapping based on user feedback and schema
  const programByDepartment = {
    'Computer Science': ['BCS', 'BSE', 'BAI'],
    'Mechanical': ['BME'],
    'Civil': ['BCE'], // Note: Assuming BCE for Chemical? Adjust if needed based on your schema
    'Management Sciences': ['BBA', 'BAF'],
    'Electrical': ['BEE'],
    'Computer Engineering': ['CVE'], // Adjusted based on common mappings; verify
    'Humanities': ['BPY'],
  };

  // Reverse mapping: program code to department name
  const programToDepartment = {};
  Object.entries(programByDepartment).forEach(([dept, programs]) => {
    programs.forEach(prog => {
      programToDepartment[prog] = dept;
    });
  });

  // Available years: 2022-2025
  const availableYears = [2022, 2023, 2024, 2025];

  // All possible program codes from schema
  const availablePrograms = ['BCS', 'BSE', 'BAI', 'BME', 'CVE', 'BBA', 'BAF', 'BEE', 'BCE', 'BPY'];

  // Compute full registration number dynamically
  const computeRegistrationNumber = () => {
    if (!regBatch || !regYear || !regProgram || !regNumber) return '';
    const yearSuffix = regYear.toString().slice(-2); // e.g., 2023 -> '23'
    const paddedNumber = regNumber.toString().padStart(3, '0'); // e.g., 7 -> '007'
    return `${regBatch}${yearSuffix}-${regProgram}-${paddedNumber}`;
  };

  // Update formData.registrationNumber whenever reg parts change
  useEffect(() => {
    const fullRegNo = computeRegistrationNumber();
    setFormData(prev => ({ ...prev, registrationNumber: fullRegNo }));
  }, [regBatch, regYear, regProgram, regNumber]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/home');
    }
  }, [isLoggedIn, navigate]);

  const handleRegChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'number') {
      // Restrict to 3 digits only
      if (value && !/^\d{0,3}$/.test(value)) return; // Ignore invalid input
    }
    if (field === 'batch') setRegBatch(value);
    if (field === 'year') setRegYear(value);
    if (field === 'program') {
      setRegProgram(value);
      // Auto-set department and program in formData
      const dept = programToDepartment[value];
      setFormData(prev => ({
        ...prev,
        program: value,
        department: dept || '',
      }));
    }
    if (field === 'number') setRegNumber(value);

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      verificationMethod: value,
    }));
    setShowUpload(value === 'UniversityID');
    setFile(null); // Reset file if switching
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    // Validate reg number parts
    if (!regBatch) newErrors.batch = 'Batch is required';
    if (!regYear) newErrors.year = 'Year is required';
    if (!regProgram) newErrors.program = 'Program is required';
    if (!regNumber || regNumber.length !== 3 || !/^\d{3}$/.test(regNumber)) {
      newErrors.number = '3-digit number is required';
    }
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.program) newErrors.programForm = 'Program is required'; // Separate key for form program
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.verificationMethod) newErrors.verificationMethod = 'Verification method is required';

    if (formData.verificationMethod === 'UniversityID' && !file) {
      newErrors.universityIdCard = 'University ID card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        registrationNumber: formData.registrationNumber, // Computed full regNo
        name: formData.name,
        gender: formData.gender,
        department: formData.department,
        program: formData.program,
        password: formData.password,
        verificationMethod: formData.verificationMethod,
      };

      const initResponse = await axios.post('https://css-cui-wah.vercel.app/signup/auth/signup-init', payload);

      setSuccess(initResponse.data.message || 'Initial signup successful!');

      if (formData.verificationMethod === 'OTP') {
        // Redirect to OTP verification page
        navigate('/signup/verify-otp', { state: { registrationNumber: formData.registrationNumber } });
      } else if (formData.verificationMethod === 'UniversityID' && file) {
        // Automatically handle upload after init success
        const formDataUpload = new FormData();
        formDataUpload.append('registrationNumber', formData.registrationNumber);
        formDataUpload.append('universityIdCard', file);

        const uploadResponse = await axios.post('https://css-cui-wah.vercel.app/signup/auth/upload-id', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setSuccess(uploadResponse.data.message || 'University ID uploaded successfully! Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed';
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Get available programs for the selected department (for form consistency, though now driven by regProgram)
  const availableProgramsForForm = programByDepartment[formData.department] || [];

  // Display the computed regNo for user reference
  const displayRegNo = computeRegistrationNumber();

  return (
    <div className="signup-page">
      <div className="header">
        <div className="logo-section">
          <div className="logo">
            <img src="image.png" alt=""/>
          </div>
          <div className="university-name">
            <h1>COMSATS SPORTS</h1>
            <p>SOCIETY</p>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="left-section">
          <div className="welcome-board">
            <div>
              <h1 className="welcome-title">Join the<br />COMSATS Sports Society</h1>
              <p className="welcome-subtitle">One Team One Dream</p>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <strong>🏅</strong> Access to all sports facilities and equipment
                </div>
                <div className="benefit-item">
                  <strong>🎯</strong> Participate in inter-university tournaments
                </div>
                <div className="benefit-item">
                  <strong>💪</strong> Free training sessions with professional coaches
                </div>
                <div className="benefit-item">
                  <strong>🏆</strong> Compete for prizes and recognition
                </div>
                <div className="benefit-item">
                  <strong>🤝</strong> Build lifelong friendships and networks
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-section">
          <h2 className="form-title">Student Registration</h2>
          {success && <div className="success-message">{success}</div>}
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Registration Number Builder Section - Horizontal Layout */}
            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <div className="regno-builder">
                <select
                  className={`form-select ${errors.batch ? 'error' : ''}`}
                  value={regBatch}
                  onChange={handleRegChange('batch')}
                  disabled={loading}
                >
                  <option value="">Select Batch</option>
                  <option value="FA">FA (Fall)</option>
                  <option value="SP">SP (Spring)</option>
                </select>
                {errors.batch && <span className="error-text">{errors.batch}</span>}

                <select
                  className={`form-select ${errors.year ? 'error' : ''}`}
                  value={regYear}
                  onChange={handleRegChange('year')}
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && <span className="error-text">{errors.year}</span>}

                <select
                  className={`form-select ${errors.program ? 'error' : ''}`}
                  value={regProgram}
                  onChange={handleRegChange('program')}
                  disabled={loading}
                >
                  <option value="">Select Program</option>
                  {availablePrograms.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
                {errors.program && <span className="error-text">{errors.program}</span>}

                <input
                  type="text"
                  className={`form-input ${errors.number ? 'error' : ''}`}
                  placeholder="007"
                  value={regNumber}
                  onChange={handleRegChange('number')}
                  maxLength={3}
                  pattern="[0-9]{3}"
                  disabled={loading}
                  required
                />
                {errors.number && <span className="error-text">{errors.number}</span>}
              </div>
              {displayRegNo && <p className="regno-preview">Preview: <strong>{displayRegNo}</strong></p>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className={`form-select ${errors.gender ? 'error' : ''}`}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            {/* Department and Program - Now auto-filled from regProgram, but shown for reference/selection */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  className={`form-input ${errors.department ? 'error' : ''}`}
                  value={formData.department}
                  readOnly // Locked since derived from regProgram
                  disabled={loading}
                  required
                />
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Program *</label>
                <input
                  type="text"
                  className={`form-input ${errors.programForm ? 'error' : ''}`}
                  value={formData.program}
                  readOnly // Locked since derived from regProgram
                  disabled={loading}
                  required
                />
                {errors.programForm && <span className="error-text">{errors.programForm}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password (min 8 chars)"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Verification Method *</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="OTP"
                    checked={formData.verificationMethod === 'OTP'}
                    onChange={handleRadioChange}
                    disabled={loading}
                  />
                  Email OTP
                </label>
                <label>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="UniversityID"
                    checked={formData.verificationMethod === 'UniversityID'}
                    onChange={handleRadioChange}
                    disabled={loading}
                  />
                  University ID Card
                </label>
              </div>
              {errors.verificationMethod && <span className="error-text">{errors.verificationMethod}</span>}
            </div>

            {showUpload && (
              <div className="form-group upload-section">
                <label className="form-label">Upload University ID Card *</label>
                <input
                  type="file"
                  className={`form-input ${errors.universityIdCard ? 'error' : ''}`}
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  required
                />
                {errors.universityIdCard && <span className="error-text">{errors.universityIdCard}</span>}
              </div>
            )}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Next'}
            </button>
          </form>

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .regno-builder {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: end;
          margin-bottom: 10px;
        }
        .regno-builder .form-select,
        .regno-builder .form-input {
          flex: 1;
          min-width: 80px; /* Adjust as needed for equal spacing */
        }
        .regno-preview {
          font-size: 0.9em;
          color: #666;
          margin-top: 5px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}