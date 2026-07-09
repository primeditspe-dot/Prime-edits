import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Cloudinary if credentials exist
let isCloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  isCloudinaryConfigured = true;
  console.log('✔ Cloudinary configured successfully.');
} else {
  console.warn('⚠️ Cloudinary environment variables are missing. File uploads will run in MOCK mode.');
}

// Initialize Firebase Admin (Firestore)
let db = null;
let isFirestoreConfigured = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    isFirestoreConfigured = true;
    console.log('✔ Firestore initialized successfully via Service Account JSON.');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    db = admin.firestore();
    isFirestoreConfigured = true;
    console.log('✔ Firestore initialized via GOOGLE_APPLICATION_CREDENTIALS.');
  } else {
    console.warn('⚠️ No Firebase service account provided. Firestore will operate in MOCK mode.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.warn('⚠️ Falling back to MOCK database mode.');
}

// Mock databases for development fallback
const mockDb = {
  contacts: [
    {
      id: 'mock_1',
      name: 'Alex Rivera',
      email: 'alex@lumina.design',
      phone: '+1 (555) 234-5678',
      service: 'YouTube Style Edit',
      budget: '$1,000 - $2,500',
      message: 'Looking for a dedicated editor for my weekly design vlogs. Need high energy cuts, custom zooms, and clean graphics. Here is raw footage link.',
      fileUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      status: 'New',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      notes: ''
    },
    {
      id: 'mock_2',
      name: 'Sarah Chen',
      email: 'sarah@fitpulse.co',
      phone: '+1 (555) 987-6543',
      service: 'TikTok/Shorts Package',
      budget: '$2,500 - $5,000',
      message: 'Hey Prime Edits! We need 30 short-form video edits per month for our fitness brand. Dynamic captions, sound effects, and highly engaging hooks are a must.',
      fileUrl: '',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      notes: 'Sent preliminary proposal. Waiting for raw asset drive.'
    },
    {
      id: 'mock_3',
      name: 'Marcus Brody',
      email: 'm.brody@legacyholding.com',
      phone: '+1 (555) 456-7890',
      service: 'Corporate/Promo Video',
      budget: '$5,000+',
      message: 'We are launching our new SaaS platform next month and need a high-end, cinematic product walkthrough video and social promo cuts.',
      fileUrl: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
      status: 'Completed',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
      notes: 'Project completed and delivered. Client was extremely satisfied with the conversion results!'
    }
  ],
  portfolio: [
    {
      id: '1',
      title: 'Vlog Style Edit - Travel Journey',
      clientType: 'YouTube Creator',
      editStyle: 'Fast-paced, high energy, sound design intensive',
      beforeUrl: 'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/dog.mp4',
      afterUrl: 'https://res.cloudinary.com/demo/video/upload/e_sepia/dog.mp4', // demo grading
      results: '+45% Retention, 120k Views',
      category: 'youtube'
    },
    {
      id: '2',
      title: 'Fitness Gear Launch',
      clientType: 'E-commerce Brand',
      editStyle: 'Cinematic, heavy color grading, rhythm cuts',
      beforeUrl: 'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/elephants.mp4',
      afterUrl: 'https://res.cloudinary.com/demo/video/upload/e_reverse/elephants.mp4',
      results: '3.2% Conversion Rate, 50k Reach',
      category: 'corporate'
    },
    {
      id: '3',
      title: 'Spiritual Walk - 9:16 Shorts',
      clientType: 'TikTok/Instagram Influencer',
      editStyle: 'Dynamic captions, zoom-ins, sound effects',
      beforeUrl: 'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/sea.mp4',
      afterUrl: 'https://res.cloudinary.com/demo/video/upload/e_vignette/sea.mp4',
      results: '1.2M Views, +15k Followers',
      category: 'shorts'
    }
  ],
  faqs: [
    {
      question: "How long does editing take?",
      answer: "Standard turnarounds are 24-48 hours for Short-form content (Reels/Shorts) and 3-5 business days for longer-form YouTube videos or Promotional campaigns, depending on complexity."
    },
    {
      question: "How many revisions are included?",
      answer: "We include 2 rounds of revisions for the Basic package, 5 for Standard, and Unlimited revisions for our Premium tier. We want to make sure you get exactly the video you envisioned."
    },
    {
      question: "What file formats do you accept?",
      answer: "We accept all standard video formats, including MP4, MOV, AVI, ProRes, and RAW camera files. You can upload directly via our client portal or send links from Google Drive/Dropbox."
    },
    {
      question: "How do payments work?",
      answer: "For project-based contracts, we require a 50% deposit upfront and 50% upon final approval before watermarks are removed. Monthly retainers are billed at the beginning of each billing cycle."
    }
  ]
};

// --- ADMIN AUTH MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'fallback_secret');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// --- API ROUTES ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    cloudinary: isCloudinaryConfigured ? 'active' : 'mock',
    firestore: isFirestoreConfigured ? 'active' : 'mock'
  });
});

// GET: Fetch FAQs
app.get('/api/faqs', async (req, res) => {
  try {
    if (isFirestoreConfigured) {
      const snapshot = await db.collection('faqs').get();
      if (!snapshot.empty) {
        const faqs = [];
        snapshot.forEach(doc => faqs.push({ id: doc.id, ...doc.data() }));
        return res.json(faqs);
      }
    }
    // Fallback to mock
    res.json(mockDb.faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch Portfolio items
app.get('/api/portfolio', async (req, res) => {
  try {
    if (isFirestoreConfigured) {
      const snapshot = await db.collection('portfolio').get();
      if (!snapshot.empty) {
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        return res.json(items);
      }
    }
    // Fallback to mock
    res.json(mockDb.portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, service, budget, message, fileUrl } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const contactData = {
      name,
      email,
      phone: phone || '',
      service: service || 'General Inquiry',
      budget: budget || 'Not Specified',
      message,
      fileUrl: fileUrl || '',
      status: 'New',
      createdAt: new Date().toISOString()
    };

    if (isFirestoreConfigured) {
      const docRef = await db.collection('contacts').add(contactData);
      console.log(`✔ Contact inquiry saved to Firestore with ID: ${docRef.id}`);
      return res.status(201).json({ success: true, id: docRef.id, message: 'Inquiry saved successfully.' });
    } else {
      const mockId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const newContact = { id: mockId, ...contactData };
      mockDb.contacts.unshift(newContact);
      console.log('✔ Contact inquiry saved to Mock DB:', newContact);
      return res.status(201).json({ success: true, id: mockId, message: 'Inquiry saved in mock database.' });
    }
  } catch (error) {
    console.error('❌ Contact submission error:', error);
    res.status(500).json({ error: 'Failed to process contact inquiry.' });
  }
});

// GET: Generate Secure Cloudinary Upload Signature
app.get('/api/cloudinary-signature', (req, res) => {
  try {
    if (!isCloudinaryConfigured) {
      // In mock mode, return a dummy signature
      return res.json({
        signature: 'mock_signature',
        timestamp: Math.round(new Date().getTime() / 1000),
        cloudName: 'demo',
        apiKey: 'mock_api_key',
        mock: true
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    // Standard upload params that require signature
    const paramsToSign = {
      timestamp: timestamp,
      folder: 'prime_edits_uploads'
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('❌ Cloudinary signing error:', error);
    res.status(500).json({ error: 'Failed to generate upload signature.' });
  }
});

// --- ADMIN PORTAL ENDPOINTS ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'primeadmin123';

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  if (password === adminPassword) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.ADMIN_JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ error: 'Invalid admin passcode.' });
  }
});

// GET: Fetch all inquiries (Admin only)
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
  try {
    if (isFirestoreConfigured) {
      const snapshot = await db.collection('contacts').orderBy('createdAt', 'desc').get();
      const contacts = [];
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          contacts.push({ id: doc.id, ...doc.data() });
        });
      }
      return res.json(contacts);
    }
    
    // Return mock contacts sorted desc by date
    const sortedMock = [...mockDb.contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(sortedMock);
  } catch (error) {
    console.error('❌ Error fetching admin contacts:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

// PATCH: Update inquiry status (Admin only)
app.patch('/api/admin/contacts/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const validStatuses = ['New', 'In Progress', 'Completed', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    if (isFirestoreConfigured) {
      await db.collection('contacts').doc(id).update({ status });
      return res.json({ success: true, message: `Status updated to ${status}` });
    }

    // Mock DB update
    const idx = mockDb.contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockDb.contacts[idx].status = status;
      return res.json({ success: true, message: `Status updated to ${status} in mock DB` });
    } else {
      return res.status(404).json({ error: 'Inquiry not found in mock DB.' });
    }
  } catch (error) {
    console.error('❌ Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status.' });
  }
});

// PATCH: Update inquiry notes (Admin only)
app.patch('/api/admin/contacts/:id/notes', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (notes === undefined) {
      return res.status(400).json({ error: 'Notes string is required.' });
    }

    if (isFirestoreConfigured) {
      await db.collection('contacts').doc(id).update({ notes });
      return res.json({ success: true, message: 'Notes updated successfully.' });
    }

    // Mock DB update
    const idx = mockDb.contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockDb.contacts[idx].notes = notes;
      return res.json({ success: true, message: 'Notes updated successfully in mock DB.' });
    } else {
      return res.status(404).json({ error: 'Inquiry not found in mock DB.' });
    }
  } catch (error) {
    console.error('❌ Error updating inquiry notes:', error);
    res.status(500).json({ error: 'Failed to update inquiry notes.' });
  }
});

// DELETE: Delete an inquiry (Admin only)
app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isFirestoreConfigured) {
      await db.collection('contacts').doc(id).delete();
      return res.json({ success: true, message: 'Inquiry deleted successfully.' });
    }

    // Mock DB update
    const idx = mockDb.contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockDb.contacts.splice(idx, 1);
      return res.json({ success: true, message: 'Inquiry deleted successfully from mock DB.' });
    } else {
      return res.status(404).json({ error: 'Inquiry not found in mock DB.' });
    }
  } catch (error) {
    console.error('❌ Error deleting inquiry:', error);
    res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Start Server
if (process.env.NODE_ENV !== 'production' || process.env.SERVE_STATIC === 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 Prime Edits Backend server running on port ${PORT}`);
  });
}

export default app;
