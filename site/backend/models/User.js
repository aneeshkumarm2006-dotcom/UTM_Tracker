const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  id: { type: String, required: true }
}, { _id: false });

const configSchema = new mongoose.Schema({
  triggerPage: { type: String, default: '' },
  buttonId: { type: String, default: '' },
  fields: { type: [fieldSchema], default: [] }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  config: {
    type: configSchema,
    default: () => ({})
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
