const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProjectById, addMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById);

router.post('/:id/members', protect, addMember);

module.exports = router;
