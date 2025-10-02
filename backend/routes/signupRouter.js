const express = require('express');
const router = express.Router();
const {
  signupInit,
  sendOtp,
  verifyOtp,
  uploadUniId,
  approveUniId,
} = require('../controllers/signupController');

router.post('/auth/signup-init', signupInit);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/upload-id', uploadUniId);
router.post('/auth/approve-id/:regNo', approveUniId);

module.exports = router;