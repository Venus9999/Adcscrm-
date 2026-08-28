import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'crm-store.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

// Ensure persistent directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();

  // Middleware for parsing large JSON payloads (includes documents/signatures)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes First
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), persistence: 'server_disk' });
  });

  // GET /api/crm/data - Retrieve persistent CRM database snapshot
  app.get('/api/crm/data', (req, res) => {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        return res.json({ success: true, data, hasData: true });
      }
      return res.json({ success: true, data: null, hasData: false });
    } catch (err: any) {
      console.error('Error reading CRM store:', err);
      return res.status(500).json({ success: false, error: 'Failed to read persistent store', details: err.message });
    }
  });

  // POST /api/crm/data - Save CRM database snapshot to server disk
  app.post('/api/crm/data', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload format' });
      }

      // Safeguard: Do not overwrite rich existing database with empty/initial cold-start payload unless forceReset is explicitly requested
      if (fs.existsSync(STORE_FILE) && !payload.forceReset) {
        try {
          const currentRaw = fs.readFileSync(STORE_FILE, 'utf-8');
          const currentData = JSON.parse(currentRaw);
          const currentClientsCount = currentData?.clients?.length || 0;
          const incomingClientsCount = payload?.clients?.length || 0;
          const currentLeadsCount = currentData?.leads?.length || 0;
          const incomingLeadsCount = payload?.leads?.length || 0;

          if (
            (currentClientsCount > incomingClientsCount || currentLeadsCount > incomingLeadsCount) &&
            payload.isColdStart
          ) {
            return res.json({
              success: true,
              skipped: true,
              message: 'Existing CRM records protected from cold-start wipe',
            });
          }
        } catch {
          // proceed with write if parse fails
        }
      }

      // Write to temp file then rename for atomic safe write
      const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempFile, STORE_FILE);

      return res.json({
        success: true,
        savedAt: new Date().toISOString(),
        message: 'CRM database snapshot safely persisted to server disk',
      });
    } catch (err: any) {
      console.error('Error saving CRM store:', err);
      return res.status(500).json({ success: false, error: 'Failed to save to server disk', details: err.message });
    }
  });

  // POST /api/crm/backup - Create a point-in-time timestamped backup
  app.post('/api/crm/backup', (req, res) => {
    try {
      if (!fs.existsSync(STORE_FILE)) {
        return res.status(404).json({ success: false, error: 'No active CRM database found to backup' });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUPS_DIR, `crm-backup-${timestamp}.json`);
      fs.copyFileSync(STORE_FILE, backupPath);

      return res.json({
        success: true,
        filename: `crm-backup-${timestamp}.json`,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/crm/backups - List backups
  app.get('/api/crm/backups', (req, res) => {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        return res.json({ success: true, backups: [] });
      }
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f));
          return {
            filename: f,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return res.json({ success: true, backups: files });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ADCS CRM Enterprise Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to boot CRM server:', err);
  process.exit(1);
});
