// routes/outfits.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

/**
 * A helper function to find or create clothing items for a user.
 * This implements the "tag-to-item" logic where we can create items on the fly.
 * @param {string[]} itemNames - An array of names for the clothing items.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<{id: number}>>} - An array of objects to be used in a Prisma connect query.
 */
const findOrCreateItems = async (itemNames, userId) => {
  const itemConnects = [];

  // Ensure we have a default category to assign to new items.
  const category = await prisma.category.upsert({
    where: { name: 'Uncategorized' },
    update: {},
    create: { name: 'Uncategorized' },
  });

  for (const name of itemNames) {
    let item = await prisma.clothingItem.findFirst({
      where: { name, userId },
    });

    if (!item) {
      item = await prisma.clothingItem.create({
        data: {
          name,
          userId,
          categoryId: category.id,
        },
      });
    }
    itemConnects.push({ id: item.id });
  }

  return itemConnects;
};

// GET /api/outfits
router.get('/', async (req, res) => {
  try {
    const outfits = await prisma.outfit.findMany({
      where: { userId: req.user.id },
      orderBy: { wornOn: 'desc' },
      include: {
        items: true, // Include the related clothing items
      },
    });
    res.json(outfits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load outfits' });
  }
});

// POST /api/outfits
router.post('/', async (req, res) => {
  try {
    const { title, imageUrl, wornOn, itemNames } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Use our helper to get the IDs of the items, creating them if necessary
    const itemConnects = await findOrCreateItems(itemNames || [], req.user.id);

    const created = await prisma.outfit.create({
      data: {
        title: title.trim(),
        imageUrl: typeof imageUrl === 'string' ? imageUrl : '',
        wornOn: wornOn ? new Date(wornOn) : new Date(),
        userId: req.user.id,
        items: {
          connect: itemConnects, // Connect the outfit to the clothing items
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create outfit' });
  }
});

// PUT /api/outfits/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, imageUrl, wornOn, itemNames } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Ensure ownership
    const existing = await prisma.outfit.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // Use our helper to get the IDs of the items for the update
    const itemConnects = await findOrCreateItems(itemNames || [], req.user.id);

    const updated = await prisma.outfit.update({
      where: { id },
      data: {
        title: title.trim(),
        imageUrl: typeof imageUrl === 'string' ? imageUrl : existing.imageUrl,
        wornOn: wornOn ? new Date(wornOn) : existing.wornOn,
        items: {
          // Replace the old list of items with the new one
          set: itemConnects,
        },
      },
      include: {
        items: true,
      },
    });

    res.json(updated);
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

    // Ensure ownership before deleting
    const existing = await prisma.outfit.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    await prisma.outfit.delete({
      where: { id },
    });

    res.status(204).send(); // Send a 204 No Content response for successful deletion
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

export default router;
