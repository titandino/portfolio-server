const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  shortDesc: { type: String, required: true },
  date: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  type: { type: String, required: true },
});

module.exports = mongoose.model('Project', projectSchema);
