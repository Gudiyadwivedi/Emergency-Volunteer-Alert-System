import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      default: "user",
    },

    // OTP Fields
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },

    // USER (Victim) fields
    medicalInfo: {
      bloodGroup: { type: String },
      diseases: { type: String },
      allergies: { type: String },
    },

    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],

    // VOLUNTEER fields
    verified: { type: Boolean, default: false },

    available: { type: Boolean, default: true },
    status:{type: Boolean, default: true},
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    
  refreshToken: {
    type:String
}
  },

  
  { timestamps: true },


);

// Geo Index
userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// FIXED Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", userSchema);

export default User;