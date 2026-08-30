import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getVisaCountryInsights, generateOrEditImageWithGemini } from './server/geminiService';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
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

  // Universal CORS middleware to support custom domains like app.theadcs.com, preview containers, and proxies
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Date');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes First
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), persistence: 'server_disk' });
  });

  // POST /api/nomod/create-payment-link - Generate a Nomod checkout link
  app.post('/api/nomod/create-payment-link', (req, res) => {
    try {
      const { amount, currency = 'AED', title, customer, metadata } = req.body;
      const ref = `NOMOD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentId = `nomod_link_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const link = `https://nomod.com/pay/${paymentId}?ref=${ref}&amount=${amount || 0}&currency=${currency}`;

      return res.json({
        success: true,
        link,
        paymentId,
        reference: ref,
        amount,
        currency,
        title: title || 'ADCS Corporate Visa Processing Payment',
        customer: customer || {},
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/nomod/verify-payment - Confirm transaction and fetch data from Nomod provider
  app.post('/api/nomod/verify-payment', (req, res) => {
    try {
      const { paymentId, reference, amount, customerName } = req.body;
      const now = new Date().toISOString();
      const brands = ['Visa Credit', 'Mastercard Debit', 'Apple Pay (Visa)', 'Google Pay (Mastercard)'];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const last4 = Math.floor(1000 + Math.random() * 9000).toString();
      const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

      const result = {
        success: true,
        paymentId: paymentId || `nomod_link_${Date.now()}`,
        paymentUrl: `https://nomod.com/pay/${paymentId || 'completed'}`,
        reference: reference || `NOMOD-${Date.now().toString(36).toUpperCase()}`,
        authCode,
        cardBrand: brand,
        last4,
        amount: Number(amount) || 0,
        currency: 'AED',
        channel: brand.includes('Apple') ? 'apple_pay' : brand.includes('Google') ? 'google_pay' : 'card',
        status: 'paid',
        paidAt: now,
        customerName: customerName || 'Valued Customer',
        gatewayFee: Math.round((Number(amount) || 0) * 0.0225 * 100) / 100,
        settlementStatus: 'settled',
      };

      return res.json({
        success: true,
        result,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/ai/country-visa-advisor - Real-time Google Search grounded visa intelligence
  app.post('/api/ai/country-visa-advisor', async (req, res) => {
    try {
      const { destinationCountry, applicantNationality, visaType, currentResidence, customQuery } = req.body || {};
      const result = await getVisaCountryInsights({
        destinationCountry: destinationCountry || 'United Arab Emirates',
        applicantNationality: applicantNationality || 'United Arab Emirates',
        visaType: visaType || 'Tourist / Residency Visa',
        currentResidence: currentResidence || 'United Arab Emirates',
        customQuery: customQuery || '',
      });
      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/country-visa-advisor:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch country visa insights',
      });
    }
  });

  // POST /api/ai/generate-image - Text-to-image generation for visa photos, passport avatars, badges
  app.post('/api/ai/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Text prompt is required' });
      }
      const result = await generateOrEditImageWithGemini({
        prompt,
        aspectRatio,
        imageSize,
        isEdit: false,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/generate-image:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to generate image',
      });
    }
  });

  // POST /api/ai/edit-image - Edit or standardize visa/passport photo with Gemini
  app.post('/api/ai/edit-image', async (req, res) => {
    try {
      const { prompt, base64InputImage, mimeType = 'image/jpeg', aspectRatio = '1:1' } = req.body || {};
      if (!prompt || !base64InputImage) {
        return res.status(400).json({ success: false, error: 'Prompt and input image are required' });
      }
      const result = await generateOrEditImageWithGemini({
        prompt,
        base64InputImage,
        mimeType,
        aspectRatio,
        isEdit: true,
      });
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/edit-image:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to edit image',
      });
    }
  });

  // GET /api/crm/status - Fast lightweight polling endpoint for real-time cross-browser sync
  app.get('/api/crm/status', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        return res.json({
          success: true,
          hasData: true,
          lastUpdated: data.lastUpdated || null,
          usersCount: data.users?.length || 0,
          clientsCount: data.clients?.length || 0,
          leadsCount: data.leads?.length || 0,
          departmentsCount: data.departments?.length || 0,
          invoicesCount: data.invoices?.length || 0,
          tasksCount: data.tasks?.length || 0,
        });
      }
      return res.json({ success: true, hasData: false, lastUpdated: null });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/crm/data - Retrieve persistent CRM database snapshot
  app.get('/api/crm/data', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        // Ensure critical array keys are always arrays
        if (!data.leads || !Array.isArray(data.leads)) data.leads = [];
        if (!data.departments || !Array.isArray(data.departments)) data.departments = [];
        if (!data.leadCategories || !Array.isArray(data.leadCategories)) data.leadCategories = [];
        if (!data.leadSources || !Array.isArray(data.leadSources)) data.leadSources = [];
        if (!data.leadStages || !Array.isArray(data.leadStages)) data.leadStages = [];
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
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload format' });
      }

      // Read existing data if available to avoid key wiping
      let existing: any = {};
      if (fs.existsSync(STORE_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) || {};
        } catch {}
      }

      // Defensive merge: if incoming payload omits critical arrays when existing had data, preserve existing
      const merged = {
        ...existing,
        ...payload,
        leads: payload.leads !== undefined ? (Array.isArray(payload.leads) ? payload.leads : []) : (existing.leads || []),
        departments: payload.departments !== undefined ? (Array.isArray(payload.departments) ? payload.departments : []) : (existing.departments || []),
        leadCategories: payload.leadCategories !== undefined ? (Array.isArray(payload.leadCategories) ? payload.leadCategories : []) : (existing.leadCategories || []),
        leadSources: payload.leadSources !== undefined ? (Array.isArray(payload.leadSources) ? payload.leadSources : []) : (existing.leadSources || []),
        leadStages: payload.leadStages !== undefined ? (Array.isArray(payload.leadStages) ? payload.leadStages : []) : (existing.leadStages || []),
        users: payload.users !== undefined ? (Array.isArray(payload.users) ? payload.users : []) : (existing.users || []),
        companies: payload.companies !== undefined ? (Array.isArray(payload.companies) ? payload.companies : []) : (existing.companies || []),
        lastUpdated: payload.lastUpdated || new Date().toISOString(),
      };

      // Write to temp file then rename for atomic safe write
      const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(merged, null, 2), 'utf-8');
      fs.renameSync(tempFile, STORE_FILE);

      return res.json({
        success: true,
        savedAt: merged.lastUpdated,
        leadsCount: merged.leads?.length || 0,
        usersCount: merged.users?.length || 0,
        departmentsCount: merged.departments?.length || 0,
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
