const Project = require('../models/Project');
const User = require('../models/User');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { email } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, getProjectById, addMember };
