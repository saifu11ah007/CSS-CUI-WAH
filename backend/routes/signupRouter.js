const express = require('express');
const router = express.Router();
const {
  signupInit,
  sendOtp,
  verifyOtp,
  uploadUniId,
  approveUniId,
} = require('../controllers/signupController');
const upload = require('../middleware/upload.js').default; // Default export from upload.js
const saveToBlob = require('../middleware/upload.js').saveToBlob;

const { loginUser } = require('../controllers/loginController');
//login
router.post('/auth/login', loginUser);
//signup
router.post('/auth/signup-init', signupInit);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/upload-id', upload, saveToBlob, uploadUniId); // Order: Parse multipart, save to Blob, then controller
router.post('/auth/approve-id/:regNo', approveUniId);

module.exports = router;