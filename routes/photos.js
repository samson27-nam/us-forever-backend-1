
const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const Photo = require('../models/Photo');
const protect = require('../middleware/auth');

// Get all photos
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload a photo (Protected)
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const newPhoto = new Photo({
      url: req.file.path,
      publicId: req.file.filename,
      caption: req.body.caption,
      uploadedBy: req.user.id
    });
    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a photo (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId);
    // Delete from DB
    await photo.deleteOne();
    
    res.json({ message: 'Moment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
