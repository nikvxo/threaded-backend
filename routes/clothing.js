// routes/clothing.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

// GET /api/clothing
// Gets all clothing items for the logged-in user
router.get('/', async (req, res) => {
  try {
    const clothingItems = await prisma.clothingItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true, // Also include the category information
      },
    });
    res.json(clothingItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load clothing items' });
  }
});

// POST /api/clothing
// Manually creates a new clothing item
router.post('/', async (req, res) => {
  try {
    const { name, imageUrl, categoryId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!categoryId || !Number.isInteger(categoryId)) {
      return res.status(400).json({ error: 'A valid categoryId is required' });
    }

    // Optional: Check if category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const newItem = await prisma.clothingItem.create({
      data: {
        name: name.trim(),
        imageUrl: imageUrl || '',
        userId: req.user.id,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create clothing item' });
  }
});

// PUT /api/clothing/:id
// Updates a clothing item
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, imageUrl, categoryId } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Ensure ownership
    const existing = await prisma.clothingItem.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    const dataToUpdate = {};
    if (name && name.trim()) dataToUpdate.name = name.trim();
    if (typeof imageUrl === 'string') dataToUpdate.imageUrl = imageUrl;
    if (categoryId && Number.isInteger(categoryId)) {
      // Optional: Check if category exists
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return res.status(400).json({ error: 'Category not found' });
      }
      dataToUpdate.categoryId = categoryId;
    }

    const updatedItem = await prisma.clothingItem.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
      },
    });

    res.json(updatedItem);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Clothing item not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update clothing item' });
  }
});

// DELETE /api/clothing/:id
// Deletes a clothing item
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Ensure ownership
    const existing = await prisma.clothingItem.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    await prisma.clothingItem.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Clothing item not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete clothing item' });
  }
});

export default router;
