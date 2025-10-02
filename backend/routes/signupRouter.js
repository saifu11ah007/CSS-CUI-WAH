const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  signupInit,
  sendOtp,
  verifyOtp,
  uploadUniId,
  approveUniId,
} = require('../controllers/signupController');

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// User Signup Routes
router.post('/auth/signup-init', signupInit);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/upload-id', upload.single('universityIdCard'), uploadUniId);

// Admin Routes
router.post('/auth/approve-id/:regNo', approveUniId);

module.exports = router;