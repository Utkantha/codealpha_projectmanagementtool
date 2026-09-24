const List = require('../models/List');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

// Lists
const getLists = async (req, res) => {
  try {
    const lists = await List.find({ project: req.params.projectId }).sort('order');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createList = async (req, res) => {
  const { title } = req.body;
  try {
    const listCount = await List.countDocuments({ project: req.params.projectId });
    const list = await List.create({
      title,
      project: req.params.projectId,
      order: listCount
    });
    
    req.io.to(req.params.projectId).emit('board_updated');
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).sort('order').populate('assignees', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, listId } = req.body;
  try {
    const taskCount = await Task.countDocuments({ list: listId });
    const task = await Task.create({
      title,
      description,
      list: listId,
      project: req.params.projectId,
      order: taskCount
    });
    
    req.io.to(req.params.projectId).emit('board_updated');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
    req.io.to(task.project.toString()).emit('board_updated');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskOrder = async (req, res) => {
  const { tasks } = req.body; // Array of { _id, order, list }
  try {
    for (const t of tasks) {
      await Task.findByIdAndUpdate(t._id, { order: t.order, list: t.list });
    }
    req.io.to(req.params.projectId).emit('board_updated');
    res.json({ message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId }).populate('user', 'name').sort('-createdAt');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComment = async (req, res) => {
  const { content } = req.body;
  try {
    const comment = await Comment.create({
      content,
      task: req.params.taskId,
      user: req.user._id
    });
    const populatedComment = await comment.populate('user', 'name');
    
    req.io.emit('comment_added', populatedComment);
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLists, createList, getTasks, createTask, updateTask, updateTaskOrder, getComments, createComment };
