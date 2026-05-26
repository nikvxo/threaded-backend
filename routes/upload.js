import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth } from '../middleware/requireAuth.js';
import crypto from 'crypto';
import path from 'path';
import { config } from '../lib/config.js';

const router = express.Router();

// All routes here require auth
router.use(requireAuth);

// Configure S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded.' });
    }

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const key = `uploads/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.aws.bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const imageUrl = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

    res.status(201).send({ imageUrl });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).send({ error: 'Failed to upload image' });
  }
});

export default router;