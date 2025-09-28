const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { sendEmailOTP } = require('../config/OTP.js');
const User = require('../models/User.js');

// In-memory store for temporary user data
const tempUserStore = new Map();

// Helper to validate registration number
const validateRegNo = (regNo) => {
  const regNoPattern = /^(FA|SP)(\d{2})-(BSE|BCS|BAI|BME|CVE|BBA|BAF|BEE|BCE|BPY)-\d{3}$/;
  if (!regNoPattern.test(regNo)) return false;
  
  const batchYear = parseInt(regNo.match(/^(FA|SP)(\d{2})/)[2], 10) + 2000;
  const currentYear = new Date().getFullYear();
  return batchYear >= 2022 && batchYear <= currentYear;
};

// Helper to generate email from regNo
const generateEmail = (regNo) => `${regNo.toLowerCase()}@cuiwah.edu.pk`;

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup initialization
const signupInit = async (req, res) => {
  try {
    const { registrationNumber, gender, department, program, password, verificationMethod } = req.body;

    // Validate inputs
    if (!registrationNumber || !validateRegNo(registrationNumber)) {
      return res.status(400).json({ message: 'Invalid registration number format' });
    }
    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({ message: 'Gender must be Male or Female' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!['OTP', 'UniversityID'].includes(verificationMethod)) {
      return res.status(400).json({ message: 'Invalid verification method' });
    }

    // Check if regNo already exists
    const existingUser = await User.findOne({ registrationNumber });
    if (existingUser) {
      return res.status(409).json({ message: 'Registration number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email
    const email = generateEmail(registrationNumber);

    // Store temp user data
    const tempUserData = {
      registrationNumber,
      email,
      gender,
      department,
      program,
      password: hashedPassword,
      verificationMethod,
      createdAt: new Date(),
    };
    tempUserStore.set(registrationNumber, tempUserData);

    res.status(200).json({ message: 'Initial signup successful, proceed to verification', email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const tempUser = tempUserStore.get(registrationNumber);
    if (!tempUser || tempUser.verificationMethod !== 'OTP') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update temp store with OTP
    tempUser.otp = { code: otp, expiresAt };
    tempUserStore.set(registrationNumber, tempUser);

    // Send OTP
    await sendEmailOTP(tempUser.email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { registrationNumber, otp } = req.body;

    const tempUser = tempUserStore.get(registrationNumber);
    if (!tempUser || tempUser.verificationMethod !== 'OTP') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    // Check OTP validity
    if (!tempUser.otp || tempUser.otp.code !== otp || tempUser.otp.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Save user to database
    const user = new User({
      registrationNumber: tempUser.registrationNumber,
      name: tempUser.name || tempUser.registrationNumber, // Name not provided in input, using regNo as fallback
      gender: tempUser.gender,
      department: tempUser.department,
      program: tempUser.program,
      password: tempUser.password,
      verificationMethod: tempUser.verificationMethod,
      isVerified: true,
    });

    await user.save();

    // Clear temp data
    tempUserStore.delete(registrationNumber);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload University ID
const uploadUniId = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const file = req.file;

    const tempUser = tempUserStore.get(registrationNumber);
    if (!tempUser || tempUser.verificationMethod !== 'UniversityID') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Store file URL (assuming cloud storage or local path)
    tempUser.universityIdCard = {
      fileUrl: file.path, // Adjust based on your file upload setup
      verified: false,
    };
    tempUserStore.set(registrationNumber, tempUser);

    res.status(200).json({ message: 'University ID uploaded, awaiting admin approval' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve University ID (Admin)
const approveUniId = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const tempUser = tempUserStore.get(registrationNumber);
    if (!tempUser || tempUser.verificationMethod !== 'UniversityID') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    if (!tempUser.universityIdCard || tempUser.universityIdCard.verified) {
      return res.status(400).json({ message: 'No pending University ID for approval' });
    }

    // Mark as verified
    tempUser.universityIdCard.verified = true;
    tempUserStore.set(registrationNumber, tempUser);

    // Save user to database
    const user = new User({
      registrationNumber: tempUser.registrationNumber,
      name: tempUser.name || tempUser.registrationNumber, // Name not provided in input, using regNo as fallback
      gender: tempUser.gender,
      department: tempUser.department,
      program: tempUser.program,
      password: tempUser.password,
      verificationMethod: tempUser.verificationMethod,
      universityIdCard: tempUser.universityIdCard,
      isVerified: true,
    });

    await user.save();

    // Clear temp data
    tempUserStore.delete(registrationNumber);

    res.status(201).json({ message: 'User registered successfully after ID approval' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signupInit,
  sendOtp,
  verifyOtp,
  uploadUniId,
  approveUniId,
};