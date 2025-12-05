import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// get all outfits
app.get('/api/outfits', async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const result = outfits.map((o) => ({
      id: o.id,
      title: o.title,
      tags: JSON.parse(o.tagsJson),
      mood: o.mood,
      createdAt: o.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load outfits' });
  }
});

// create new outfit
app.post('/api/outfits', async (req, res) => {
  try {
    const { title, tags, mood } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const created = await prisma.outfit.create({
      data: {
        title: title.trim(),
        tagsJson: JSON.stringify(Array.isArray(tags) ? tags : []),
        mood: typeof mood === 'string' ? mood : '',
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      tags: JSON.parse(created.tagsJson),
      mood: created.mood,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create outfit' });
  }
});

// update outfit
app.put('/api/outfits/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, tags, mood } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const data = { title: title.trim() };
    if (Array.isArray(tags)) data.tagsJson = JSON.stringify(tags);
    if (typeof mood === 'string') data.mood = mood;

    const updated = await prisma.outfit.update({
      where: { id },
      data,
    });

    res.json({
      id: updated.id,
      title: updated.title,
      tags: JSON.parse(updated.tagsJson),
      mood: updated.mood,
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

// delete outfit
app.delete('/api/outfits/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const deleted = await prisma.outfit.delete({
      where: { id },
    });

    res.json({
      id: deleted.id,
      title: deleted.title,
      tags: JSON.parse(deleted.tagsJson),
      mood: deleted.mood,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

