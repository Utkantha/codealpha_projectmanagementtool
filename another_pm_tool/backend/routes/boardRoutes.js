const express = require('express');
const router = express.Router({ mergeParams: true });
const { getLists, createList, getTasks, createTask, updateTask, updateTaskOrder, getComments, createComment } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:projectId/lists')
  .get(protect, getLists)
  .post(protect, createList);

router.route('/:projectId/tasks')
  .get(protect, getTasks)
  .post(protect, createTask);

router.put('/:projectId/tasks/order', protect, updateTaskOrder);

router.route('/:projectId/tasks/:taskId')
  .put(protect, updateTask);

router.route('/:projectId/tasks/:taskId/comments')
  .get(protect, getComments)
  .post(protect, createComment);

module.exports = router;
