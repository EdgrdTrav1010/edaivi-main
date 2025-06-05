/**
 * EdAiVi Studio - Audio Routes
 * 
 * This file contains all routes related to audio projects:
 * - Creating and managing audio projects
 * - Audio track operations
 * - Audio processing and effects
 * - AI audio generation and enhancement
 */

const express = require('express');
const router = express.Router();
const AudioProject = require('../models/AudioProject');
const User = require('../models/User');
const { verifyToken } = require('./auth');

// Get all audio projects for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await AudioProject.find({ 
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id },
        { isPublic: true }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Ошибка получения аудио проектов:', error);
    res.status(500).json({ 
      error: 'Ошибка получения аудио проектов',
      message: error.message
    });
  }
});

// Create a new audio project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, bpm, key, tags } = req.body;
    
    const newProject = new AudioProject({
      title,
      description,
      owner: req.user._id,
      bpm: bpm || 120,
      key,
      tags
    });
    
    await newProject.save();
    
    res.status(201).json({
      message: 'Аудио проект успешно создан',
      project: newProject
    });
  } catch (error) {
    console.error('Ошибка создания аудио проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка создания аудио проекта',
      message: error.message
    });
  }
});

// Get a specific audio project
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await AudioProject.findById(req.params.id)
      .populate('owner', 'displayName email avatar')
      .populate('collaborators.user', 'displayName email avatar');
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user has access to the project
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      collab => collab.user._id.toString() === req.user._id.toString()
    );
    
    if (!isOwner && !isCollaborator && !project.isPublic) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'У вас нет доступа к этому проекту'
      });
    }
    
    // Update last opened timestamp
    project.lastOpened = new Date();
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Ошибка получения аудио проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка получения аудио проекта',
      message: error.message
    });
  }
});

// Update an audio project
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, bpm, key, tags, isPublic, masterSettings } = req.body;
    
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Только владелец проекта может обновлять его'
      });
    }
    
    // Update fields
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (bpm) project.bpm = bpm;
    if (key) project.key = key;
    if (tags) project.tags = tags;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (masterSettings) project.masterSettings = { ...project.masterSettings, ...masterSettings };
    
    await project.save();
    
    res.json({
      message: 'Аудио проект успешно обновлен',
      project
    });
  } catch (error) {
    console.error('Ошибка обновления аудио проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка обновления аудио проекта',
      message: error.message
    });
  }
});

// Delete an audio project
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Только владелец проекта может удалять его'
      });
    }
    
    await project.remove();
    
    res.json({
      message: 'Аудио проект успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления аудио проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка удаления аудио проекта',
      message: error.message
    });
  }
});

// Add a track to an audio project
router.post('/:id/tracks', verifyToken, async (req, res) => {
  try {
    const { name, type, fileUrl, duration, startTime, volume } = req.body;
    
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user has edit access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString() && collab.role === 'editor'
    );
    
    if (!isOwner && !isEditor) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'У вас нет прав на редактирование этого проекта'
      });
    }
    
    // Create new track
    const newTrack = {
      name,
      type: type || 'other',
      fileUrl,
      duration: duration || 0,
      startTime: startTime || 0,
      volume: volume || 1.0
    };
    
    // Add track to project
    await project.addTrack(newTrack);
    
    res.status(201).json({
      message: 'Трек успешно добавлен',
      track: project.tracks[project.tracks.length - 1],
      projectDuration: project.duration
    });
  } catch (error) {
    console.error('Ошибка добавления трека:', error);
    res.status(500).json({ 
      error: 'Ошибка добавления трека',
      message: error.message
    });
  }
});

// Update a track
router.put('/:id/tracks/:trackId', verifyToken, async (req, res) => {
  try {
    const { name, startTime, volume, muted, solo, effects } = req.body;
    
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user has edit access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString() && collab.role === 'editor'
    );
    
    if (!isOwner && !isEditor) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'У вас нет прав на редактирование этого проекта'
      });
    }
    
    // Find track
    const track = project.tracks.id(req.params.trackId);
    
    if (!track) {
      return res.status(404).json({ 
        error: 'Трек не найден',
        message: 'Трек не найден в проекте'
      });
    }
    
    // Update track fields
    if (name) track.name = name;
    if (startTime !== undefined) track.startTime = startTime;
    if (volume !== undefined) track.volume = volume;
    if (muted !== undefined) track.muted = muted;
    if (solo !== undefined) track.solo = solo;
    if (effects) track.effects = effects;
    
    // Update project
    await project.updateTrack(req.params.trackId, track);
    
    res.json({
      message: 'Трек успешно обновлен',
      track,
      projectDuration: project.duration
    });
  } catch (error) {
    console.error('Ошибка обновления трека:', error);
    res.status(500).json({ 
      error: 'Ошибка обновления трека',
      message: error.message
    });
  }
});

// Remove a track
router.delete('/:id/tracks/:trackId', verifyToken, async (req, res) => {
  try {
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user has edit access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString() && collab.role === 'editor'
    );
    
    if (!isOwner && !isEditor) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'У вас нет прав на редактирование этого проекта'
      });
    }
    
    // Remove track
    await project.removeTrack(req.params.trackId);
    
    res.json({
      message: 'Трек успешно удален',
      projectDuration: project.duration
    });
  } catch (error) {
    console.error('Ошибка удаления трека:', error);
    res.status(500).json({ 
      error: 'Ошибка удаления трека',
      message: error.message
    });
  }
});

// Export audio project
router.post('/:id/export', verifyToken, async (req, res) => {
  try {
    const { format, quality } = req.body;
    
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user has access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString()
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'У вас нет доступа к этому проекту'
      });
    }
    
    // Export project
    const exportedFile = await project.export(format, quality);
    
    res.json({
      message: 'Проект успешно экспортирован',
      file: exportedFile
    });
  } catch (error) {
    console.error('Ошибка экспорта проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка экспорта проекта',
      message: error.message
    });
  }
});

// Add a collaborator to a project
router.post('/:id/collaborators', verifyToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Только владелец проекта может добавлять соавторов'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден',
        message: 'Пользователь с таким email не найден'
      });
    }
    
    // Check if user is already a collaborator
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === user._id.toString()
    );
    
    if (isCollaborator) {
      return res.status(400).json({ 
        error: 'Пользователь уже является соавтором',
        message: 'Пользователь уже добавлен в проект'
      });
    }
    
    // Add collaborator
    project.collaborators.push({
      user: user._id,
      role: role || 'viewer',
      addedAt: new Date()
    });
    
    await project.save();
    
    res.json({
      message: 'Соавтор успешно добавлен',
      collaborator: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar
        },
        role: role || 'viewer',
        addedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Ошибка добавления соавтора:', error);
    res.status(500).json({ 
      error: 'Ошибка добавления соавтора',
      message: error.message
    });
  }
});

// Remove a collaborator from a project
router.delete('/:id/collaborators/:userId', verifyToken, async (req, res) => {
  try {
    const project = await AudioProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Проект не найден',
        message: 'Аудио проект не найден'
      });
    }
    
    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Доступ запрещен',
        message: 'Только владелец проекта может удалять соавторов'
      });
    }
    
    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.user.toString() !== req.params.userId
    );
    
    await project.save();
    
    res.json({
      message: 'Соавтор успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления соавтора:', error);
    res.status(500).json({ 
      error: 'Ошибка удаления соавтора',
      message: error.message
    });
  }
});

module.exports = router;
