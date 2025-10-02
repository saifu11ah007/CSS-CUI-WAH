const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to transform registrationNumber for User schema (consistent with signup)
const transformRegNoForSchema = (regNo) => {
  const match = regNo.match(/^(FA|SP)(\d{2})-(BCS|BSE|BAI|BME|CVE|BBA|BAF|BEE|BCE|BPY)-(\d{3})$/i);
  if (!match) {
    console.log(`transformRegNoForSchema failed for: ${regNo}`);
    return regNo; // Fallback (may cause lookup failure)
  }
  const [, , year, program, number] = match;
  const transformed = `20${year}${program.toUpperCase()}${number}`;
  console.log(`Transformed ${regNo} to ${transformed}`);
  return transformed;
};

const loginUser = async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    // Validate inputs
    if (!registrationNumber || !password) {
      return res.status(400).json({ message: 'Registration number and password are required' });
    }

    // Normalize and transform registrationNumber
    const normalizedRegNo = registrationNumber.toUpperCase();
    const transformedRegNo = transformRegNoForSchema(normalizedRegNo);

    // Find user
    const user = await User.findOne({ registrationNumber: transformedRegNo });
    if (!user) {
      return res.status(401).json({ message: 'Invalid registration number or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid registration number or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        registrationNumber: user.registrationNumber,
        program: user.program,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        registrationNumber: normalizedRegNo, // Return original format for consistency
        email: user.email,
        gender: user.gender,
        program: user.program,
      },
    });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { loginUser };