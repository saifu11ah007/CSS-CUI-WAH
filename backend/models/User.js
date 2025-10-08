// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}(BCS|BSE|BAI|BME|CVE|BBA|BAF|BEE|BCE|BPY)\d{3}$/, "Invalid registration number format"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: [
        "Computer Science",
        "Mechanical",
        "Civil",
        "Management Sciences",
        "Electrical",
        "Computer Engineering",
        "Humanities",
      ],
      required: true,
    },
    program: {
      type: String,
      enum: ["BCS", "BSE", "BAI", "BME", "CVE", "BBA", "BAF", "BEE", "BCE", "BPY"],
      required: true,
    },
    // Verification fields
    verificationMethod: {
      type: String,
      enum: ["OTP", "UniversityID"],
      required: true,
    },
    otp: {
      code: String,
      type: String,
      expiresAt: Date,
    },
    // In User.js model
universityIdCard: {
  fileUrl: String,
  verified: { type: Boolean, default: false }
},
    isVerified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
