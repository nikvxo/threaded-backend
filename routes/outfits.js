// routes/outfits.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

// GET /api/outfits
router.get('/', async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const result = outfits.map((o) => ({
      id: o.id,
      title: o.title,
      tags: JSON.parse(o.tagsJson),
      mood: o.mood,
      imageUrl: o.imageUrl,
      createdAt: o.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load outfits' });
  }
});

// POST /api/outfits
router.post('/', async (req, res) => {
  try {
    const { title, tags, mood, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const created = await prisma.outfit.create({
      data: {
        title: title.trim(),
        tagsJson: JSON.stringify(Array.isArray(tags) ? tags : []),
        mood: typeof mood === 'string' ? mood : '',
        imageUrl: typeof imageUrl === 'string' ? imageUrl : '',
        userId: req.user.id,
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      tags: JSON.parse(created.tagsJson),
      mood: created.mood,
      imageUrl: created.imageUrl,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create outfit' });
  }
});

// PUT /api/outfits/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, tags, mood, imageUrl } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // ensure ownership
    const existing = await prisma.outfit.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    const data = { title: title.trim() };
    if (Array.isArray(tags)) data.tagsJson = JSON.stringify(tags);
    if (typeof mood === 'string') data.mood = mood;

    const updated = await prisma.outfit.update({
      where: { id, userId: req.user.id },
      data,
    });

    res.json({
      id: updated.id,
      title: updated.title,
      tags: JSON.parse(updated.tagsJson),
      mood: updated.mood,
      imageUrl: updated.imageUrl,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update outfit' });
  }
});

// DELETE /api/outfits/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // ensure ownership
    const existing = await prisma.outfit.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    const deleted = await prisma.outfit.delete({
      where: { id },
    });

    res.json({
      id: deleted.id,
      title: deleted.title,
      tags: JSON.parse(deleted.tagsJson),
      mood: deleted.mood,
      imageUrl: deleted.imageUrl,
      createdAt: deleted.createdAt,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});


export default router;
