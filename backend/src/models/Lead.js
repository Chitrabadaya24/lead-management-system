const mongoose = require('mongoose');
const { STATUSES, SOURCES, CUSTOMER_TYPES } = require('../config/constants');
const purchaseSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  amount: { type: Number, min: 0, default: 0 },
  date: { type: Date, default: Date.now },
}, { _id: false });
const schema = new mongoose.Schema({
  leadName: { type: String, required: true, trim: true, maxlength: 100 },
  contactNumber: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  status: { type: String, enum: STATUSES, default: 'new', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nextFollowUpDate: { type: Date, index: true },
  nextFollowUpTime: { type: String },
  leadSource: { type: String, enum: SOURCES, default: 'walk-in' },
  conversionDate: Date,
  leadNotes: { type: String, maxlength: 2000 },
  customerType: { type: String, enum: CUSTOMER_TYPES, default: 'new' },
  purchaseHistory: [purchaseSchema],
  medicalNeeds: { type: String, maxlength: 1000 },
}, { timestamps: true });
module.exports = mongoose.model('Lead', schema);
