// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import outfitsRoutes from './routes/outfits.js';
import uploadRoutes from './routes/upload.js';
import clothingRoutes from './routes/clothing.js';

const app = express();

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
  'http://localhost:5173',
];

app.use(
  cors({
    origin(origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// JSON body
app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/clothing', clothingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
