const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  role: String,
  shortDesc: String,
  date: String,
  desc: String,
  img: String,
  type: String
});

module.exports = mongoose.model('Project', projectSchema);
