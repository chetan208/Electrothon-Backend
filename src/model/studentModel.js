import { Schema, model } from "mongoose";

import bcrypt from "bcryptjs";

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
    password: {
      type: String,

  },
  collage: {
    type: Schema.Types.ObjectId,
    ref: "Collage",
  },

  yearOfStudy: {
    type: String,
    required: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isProfileCompleted: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },

  // Profile Info
  avatar: {
    type: String,
  },
  avatarPublicId: {
    type: String,
  },
  headline: {
    type: String,
  },
  bio: {
    type: String,
  },

  // Academic
  branch: {
    type: String,
  },
  cgpa: {
    type: String,
  },
  currentYear: {
    type: String,
  },
  graduationYear: {
    type: String,
  },
  rollNumber: {
    type: String,
  },

  // Skills
  skills: [
    {
      type: String,
    },
  ],
  interests: [
    {
      type: String,
    },
  ],
  openTo: [
    {
      type: String,
    },
  ],

  // Social Links
  github: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  portfolio: {
    type: String,
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
});



const StudentModel = model("Student", studentSchema);

export default StudentModel;
