const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const sendEmailOTP  = require('../config/OTP.js');
const User = require('../models/User.js');

// In-memory store for temporary user data
const tempUserStore = new Map();

// Helper to validate registration number
const validateRegNo = (regNo) => {
  // Case-insensitive regex
  const regNoPattern = /^(FA|SP)(\d{2})-(BCS|BSE|BAI|BME|CVE|BBA|BAF|BEE|BCE|BPY)-\d{3}$/i;
  if (!regNoPattern.test(regNo)) {
    console.log(`Invalid regNo format: ${regNo}`);
    return false;
  }
  
  const batchYear = parseInt(regNo.match(/^(FA|SP)(\d{2})/i)[2], 10) + 2000;
  const currentYear = new Date().getFullYear();
  return batchYear >= 2022 && batchYear <= currentYear;
};

// Helper to generate email from regNo
const generateEmail = (regNo) => `${regNo.toLowerCase()}@cuiwah.edu.pk`;

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to transform registrationNumber for User schema
const transformRegNoForSchema = (regNo) => {
  // Case-insensitive regex, handle FA23-BSE-007 to 2023BSE007
  const match = regNo.match(/^(FA|SP)(\d{2})-(BCS|BSE|BAI|BME|CVE|BBA|BAF|BEE|BCE|BPY)-(\d{3})$/i);
  if (!match) {
    console.log(`transformRegNoForSchema failed for: ${regNo}`);
    return regNo; // Fallback (will likely fail schema validation)
  }
  const [, , year, program, number] = match;
  const transformed = `20${year}${program.toUpperCase()}${number}`;
  console.log(`Transformed ${regNo} to ${transformed}`);
  return transformed;
};

// Signup initialization
const signupInit = async (req, res) => {
  try {
    const { registrationNumber, name, gender, department, program, password, verificationMethod } = req.body;

    // Normalize registrationNumber (convert to uppercase for consistency)
    const normalizedRegNo = registrationNumber.toUpperCase();

    // Validate inputs
    if (!normalizedRegNo || !validateRegNo(normalizedRegNo)) {
      return res.status(400).json({ message: 'Invalid registration number format' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
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
    const existingUser = await User.findOne({ registrationNumber: transformRegNoForSchema(normalizedRegNo) });
    if (existingUser) {
      return res.status(409).json({ message: 'Registration number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email
    const email = generateEmail(normalizedRegNo);

    // Store temp user data
    const tempUserData = {
      registrationNumber: normalizedRegNo,
      email,
      name,
      gender,
      department,
      program,
      password: hashedPassword,
      verificationMethod,
      createdAt: new Date(),
    };
    tempUserStore.set(normalizedRegNo, tempUserData);
    console.log(`Stored temp user: ${normalizedRegNo}`);

    res.status(200).json({ message: 'Initial signup successful, proceed to verification', email });
  } catch (error) {
    console.error('signupInit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const tempUser = tempUserStore.get(registrationNumber.toUpperCase());
    if (!tempUser || tempUser.verificationMethod !== 'OTP') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update temp store with OTP
    tempUser.otp = { code: otp, expiresAt };
    tempUserStore.set(registrationNumber.toUpperCase(), tempUser);

    // Send OTP
    await sendEmailOTP(tempUser.email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { registrationNumber, otp } = req.body;

    const normalizedRegNo = registrationNumber.toUpperCase();
    const tempUser = tempUserStore.get(normalizedRegNo);
    if (!tempUser || tempUser.verificationMethod !== 'OTP') {
      console.log(`No temp user found for: ${normalizedRegNo}`);
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    // Check OTP validity
    if (!tempUser.otp || tempUser.otp.code !== otp || tempUser.otp.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Save user to database
    const transformedRegNo = transformRegNoForSchema(normalizedRegNo);
    const user = new User({
      registrationNumber: transformedRegNo,
      name: tempUser.name || transformedRegNo,
      gender: tempUser.gender,
      department: tempUser.department,
      program: tempUser.program,
      password: tempUser.password,
      verificationMethod: tempUser.verificationMethod,
      isVerified: true,
    });

    await user.save();
    console.log(`User saved: ${transformedRegNo}`);

    // Clear temp data
    tempUserStore.delete(normalizedRegNo);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload University ID - Now saves user immediately
const uploadUniId = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const normalizedRegNo = registrationNumber.toUpperCase();
    const tempUser = tempUserStore.get(normalizedRegNo);
    if (!tempUser || tempUser.verificationMethod !== 'UniversityID') {
      return res.status(400).json({ message: 'Invalid or missing temporary user data' });
    }

    // Get uploaded file URL from middleware
    const file = req.files.universityIdCard; // Assuming single file
    if (!file || !file[0].key) {
      return res.status(400).json({ message: 'No universityIdCard file uploaded or upload failed' });
    }

    // Save user to database immediately with the uploaded ID
    const transformedRegNo = transformRegNoForSchema(normalizedRegNo);
    const user = new User({
      registrationNumber: transformedRegNo,
      name: tempUser.name || transformedRegNo,
      gender: tempUser.gender,
      department: tempUser.department,
      program: tempUser.program,
      password: tempUser.password,
      verificationMethod: tempUser.verificationMethod,
      universityIdCard: {
        fileUrl: file[0].key,
        verified: false, // Can be set to true if you want immediate verification
      },
      isVerified: true, // User is now verified immediately
    });

    await user.save();
    console.log(`User saved with University ID: ${transformedRegNo}`);

    // Clear temp data
    tempUserStore.delete(normalizedRegNo);

    res.status(201).json({ 
      message: 'User registered successfully with University ID', 
      fileUrl: file[0].key 
    });
  } catch (error) {
    console.error('uploadUniId error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve University ID (Admin) - Optional: Keep for manual verification if needed
const approveUniId = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const normalizedRegNo = registrationNumber.toUpperCase();
    const transformedRegNo = transformRegNoForSchema(normalizedRegNo);

    // Find user in database
    const user = await User.findOne({ registrationNumber: transformedRegNo });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.universityIdCard) {
      return res.status(400).json({ message: 'No University ID found for this user' });
    }

    if (user.universityIdCard.verified) {
      return res.status(400).json({ message: 'University ID already verified' });
    }

    // Mark ID as verified
    user.universityIdCard.verified = true;
    await user.save();

    console.log(`University ID verified for user: ${transformedRegNo}`);

    res.status(200).json({ message: 'University ID verified successfully' });
  } catch (error) {
    console.error('approveUniId error:', error);
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
