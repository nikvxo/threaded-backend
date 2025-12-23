// routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded.' });
  }
  res.status(201).send({ imageUrl: `/uploads/${req.file.filename}` });
});

export default router;
