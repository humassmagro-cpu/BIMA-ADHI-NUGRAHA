import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getAllAssets,
  insertAsset,
  updateAssetByUuid,
  deleteAssetByUuid,
} from './src/db/assets.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { INITIAL_ASSETS } from './src/utils/storage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed initial assets if database table is empty
  try {
    const existing = await getAllAssets();
    if (existing.length === 0) {
      for (const item of INITIAL_ASSETS) {
        await insertAsset(item);
      }
      console.log('Seeded initial assets into Cloud SQL successfully.');
    }
  } catch (err) {
    console.warn('Initial seeding check skipped or deferred:', err);
  }

  // API Endpoints for School Assets (Cloud SQL)
  app.get('/api/assets', async (_req, res) => {
    try {
      const assets = await getAllAssets();
      res.json(assets);
    } catch (error: any) {
      console.error('API /api/assets GET error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch assets' });
    }
  });

  app.post('/api/assets', async (req, res) => {
    try {
      const assetData = req.body;
      const created = await insertAsset(assetData);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('API /api/assets POST error:', error);
      res.status(500).json({ error: error.message || 'Failed to create asset' });
    }
  });

  app.put('/api/assets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const assetData = req.body;
      const updated = await updateAssetByUuid(id, assetData);
      if (!updated) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json(updated);
    } catch (error: any) {
      console.error('API /api/assets PUT error:', error);
      res.status(500).json({ error: error.message || 'Failed to update asset' });
    }
  });

  app.delete('/api/assets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteAssetByUuid(id);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error('API /api/assets DELETE error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete asset' });
    }
  });

  app.post('/api/users/sync', async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateUser(uid, email, displayName);
      res.json(user);
    } catch (error: any) {
      console.error('API /api/users/sync error:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // Client SPA Serving (Vite middleware in dev, static dist in production)
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
