require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// temporary data (no DB yet)
let outfits = [
  { id: 1, title: "Black jeans + white tee", tags: ["casual"] },
  { id: 2, title: "Navy suit", tags: ["formal"] }
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
  const { title, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newOutfit = {
    id: outfits.length ? outfits[outfits.length - 1].id + 1 : 1,
    title: title.trim(),
    tags: tags || []
  };

  outfits.push(newOutfit);
  res.status(201).json(newOutfit);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

