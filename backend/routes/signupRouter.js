const express = require('express');
const router = express.Router();
const {
  signupInit,
  sendOtp,
  verifyOtp,
  uploadUniId,
} = require('../controllers/signupController');
const upload = require('../middleware/upload.js').default;
const saveToBlob = require('../middleware/upload.js').saveToBlob;

router.post('/auth/signup-init', signupInit);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/upload-id', upload, saveToBlob, uploadUniId);

module.exports = router;