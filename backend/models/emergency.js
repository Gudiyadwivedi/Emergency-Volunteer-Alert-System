const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    victimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emergencyType: {
      type: String,
      required: true,
      enum: ["medical", "safety", "panic", "accident"],
    },

    description: { type: String },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "accepted", "reached", "resolved"],
      default: "active",
    },

    notifiedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    acceptedVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    timeline: [
      {
        message: String,
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

emergencySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Emergency", emergencySchema);