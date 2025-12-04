require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// temporary data (no DB yet)
let outfits = [
  { 
    id: 1, 
    title: "Black jeans + white tee", 
    tags: ["casual"], 
    mood: "chill",
    createdAt: new Date().toISOString(),
  },
  { 
    id: 2, 
    title: "Navy suit", 
    tags: ["formal"],
    mood: "confident",
    createdAt: new Date().toISOString(),
  }
];


// health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// get all outfits
app.get('/api/outfits', (req, res) => {
  res.json(outfits);
});

// create new outfit
app.post('/api/outfits', (req, res) => {
  const { title, tags, mood } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newOutfit = {
    id: outfits.length ? outfits[outfits.length - 1].id + 1 : 1,
    title: title.trim(),
    tags: Array.isArray(tags) ? tags : [],
    mood: mood || '',
    createdAt: new Date().toISOString(),
  };

  outfits.push(newOutfit);
  res.status(201).json(newOutfit);
});


app.put('/api/outfits/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, tags, mood } = req.body;

  const outfit = outfits.find(o => o.id === id);
  if (!outfit) {
    return res.status(404).json({ error: 'Outfit not found' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  outfit.title = title.trim();
  outfit.tags = Array.isArray(tags) ? tags : outfit.tags;
  outfit.mood = typeof mood === 'string' ? mood : outfit.mood;

  res.json(outfit);
});


// delete outfit
app.delete('/api/outfits/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = outfits.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Outfit not found' });
  }

  const deleted = outfits[index];
  outfits.splice(index, 1);
  res.json(deleted);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

