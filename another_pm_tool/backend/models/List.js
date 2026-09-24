const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('List', ListSchema);
