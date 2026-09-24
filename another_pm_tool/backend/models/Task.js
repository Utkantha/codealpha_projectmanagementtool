const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  order: { type: Number, default: 0 },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
