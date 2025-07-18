const express = require('express');
const router = express.Router();
const { Artist, Post, Delta } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { applyArtistFilter } = require('../middleware/artistFilter');

// Apply artist filter middleware
router.use(applyArtistFilter('Artist'));

// Get all artists
router.get('/', async (req, res) => {
  try {
    let where = {};
    
    // Apply artist filter if user has artist role
    if (req.user && req.user.role === 'artist' && req.user.artistId) {
      where.id = req.user.artistId;
    }
    
    const artists = await Artist.findAll({
      where,
      order: [['name', 'ASC']]
    });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get artist by ID with posts
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByPk(req.params.id, {
      include: [{
        model: Post,
        order: [['publishTime', 'DESC']]
      }]
    });
    
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get artist earnings for a period
router.get('/:id/earnings', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      artistId: req.params.id
    };
    
    if (startDate && endDate) {
      whereClause.toDate = {
        [Op.between]: [
          dayjs(startDate).startOf('day').toDate(),
          dayjs(endDate).endOf('day').toDate()
        ]
      };
    }
    
    const deltas = await Delta.findAll({
      where: whereClause,
      include: [Post],
      order: [['toDate', 'DESC']]
    });
    
    const totalEarnings = deltas.reduce((sum, delta) => 
      sum + parseFloat(delta.earningsDelta || 0), 0
    );
    
    const totalViews = deltas.reduce((sum, delta) => 
      sum + parseInt(delta.qualifiedViewsDelta || 0), 0
    );
    
    res.json({
      artist: req.params.id,
      period: { startDate, endDate },
      totalEarnings,
      totalViews,
      deltas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new artist
router.post('/', async (req, res) => {
  try {
    const { name, royaltyRate, email, notes } = req.body;
    
    const artist = await Artist.create({
      name,
      royaltyRate: royaltyRate || 0,
      email,
      notes
    });
    
    res.status(201).json(artist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update artist
router.put('/:id', async (req, res) => {
  try {
    const { name, royaltyRate, email, status, notes } = req.body;
    
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    await artist.update({
      name,
      royaltyRate,
      email,
      status,
      notes
    });
    
    res.json(artist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete artist (soft delete by setting status to inactive)
router.delete('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    await artist.update({ status: 'inactive' });
    res.json({ message: 'Artist deactivated', artist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;