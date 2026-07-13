const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  pace: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: ""
  },
  bpm: {
    type: Number,
    default: 0
  },
  steps: {
    type: Number,
    default: 0
  },
  cadence: {
    type: Number,
    default: 0
  },
  acceleration: {
    type: Number,
    default: 0
  },
  iaClass: {
    type: Number,
    default: null
  },
  iaLabel: {
    type: String,
    default: ""
  },
  iaConfidence: {
    type: Number,
    default: 0
  },
  iaRecommendation: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Activity", activitySchema);
