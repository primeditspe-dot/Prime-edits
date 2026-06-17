import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

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
  contacts: [],
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
      mockDb.contacts.push(contactData);
      console.log('✔ Contact inquiry saved to Mock DB:', contactData);
      return res.status(201).json({ success: true, message: 'Inquiry saved in mock database.' });
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Prime Edits Backend server running on port ${PORT}`);
});
