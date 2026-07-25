-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. FAQS TABLE
-- ==========================================
create table if not exists faqs (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 2. PORTFOLIO TABLE
-- ==========================================
create table if not exists portfolio (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  "clientType" text,
  "editStyle" text,
  "beforeUrl" text,
  "afterUrl" text,
  results text,
  category text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. CONTACTS TABLE
-- ==========================================
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  service text,
  budget text,
  message text not null,
  "fileUrl" text,
  status text default 'New' check (status in ('New', 'In Progress', 'Completed', 'Archived')),
  "createdAt" timestamp with time zone default timezone('utc'::text, now()),
  notes text
);

-- ==========================================
-- SEED DATA (MOCK DATA MIGRATION)
-- ==========================================

-- Seed FAQs
insert into faqs (question, answer) values
('How long does editing take?', 'Standard turnarounds are 24-48 hours for Short-form content (Reels/Shorts) and 3-5 business days for longer-form YouTube videos or Promotional campaigns, depending on complexity.'),
('How many revisions are included?', 'We include 2 rounds of revisions for the Basic package, 5 for Standard, and Unlimited revisions for our Premium tier. We want to make sure you get exactly the video you envisioned.'),
('What file formats do you accept?', 'We accept all standard video formats, including MP4, MOV, AVI, ProRes, and RAW camera files. You can upload directly via our client portal or send links from Google Drive/Dropbox.'),
('How do payments work?', 'For project-based contracts, we require a 50% deposit upfront and 50% upon final approval before watermarks are removed. Monthly retainers are billed at the beginning of each billing cycle.');

-- Seed Portfolio
insert into portfolio (title, "clientType", "editStyle", "beforeUrl", "afterUrl", results, category) values
(
  'Vlog Style Edit - Travel Journey',
  'YouTube Creator',
  'Fast-paced, high energy, sound design intensive',
  'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/dog.mp4',
  'https://res.cloudinary.com/demo/video/upload/e_sepia/dog.mp4',
  '+45% Retention, 120k Views',
  'youtube'
),
(
  'Fitness Gear Launch',
  'E-commerce Brand',
  'Cinematic, heavy color grading, rhythm cuts',
  'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/elephants.mp4',
  'https://res.cloudinary.com/demo/video/upload/e_reverse/elephants.mp4',
  '3.2% Conversion Rate, 50k Reach',
  'corporate'
),
(
  'Spiritual Walk - 9:16 Shorts',
  'TikTok/Instagram Influencer',
  'Dynamic captions, zoom-ins, sound effects',
  'https://res.cloudinary.com/demo/video/upload/w_640,h_360,c_fill/sea.mp4',
  'https://res.cloudinary.com/demo/video/upload/e_vignette/sea.mp4',
  '1.2M Views, +15k Followers',
  'shorts'
);

-- Seed Contacts (Optional initial testing items)
insert into contacts (name, email, phone, service, budget, message, "fileUrl", status, notes) values
(
  'Alex Rivera',
  'alex@lumina.design',
  '+1 (555) 234-5678',
  'YouTube Style Edit',
  '$1,000 - $2,500',
  'Looking for a dedicated editor for my weekly design vlogs. Need high energy cuts, custom zooms, and clean graphics. Here is raw footage link.',
  'https://res.cloudinary.com/demo/video/upload/dog.mp4',
  'New',
  ''
),
(
  'Sarah Chen',
  'sarah@fitpulse.co',
  '+1 (555) 987-6543',
  'TikTok/Shorts Package',
  '$2,500 - $5,000',
  'Hey Prime Edits! We need 30 short-form video edits per month for our fitness brand. Dynamic captions, sound effects, and highly engaging hooks are a must.',
  '',
  'In Progress',
  'Sent preliminary proposal. Waiting for raw asset drive.'
),
(
  'Marcus Brody',
  'm.brody@legacyholding.com',
  '+1 (555) 456-7890',
  'Corporate/Promo Video',
  '$5,000+',
  'We are launching our new SaaS platform next month and need a high-end, cinematic product walkthrough video and social promo cuts.',
  'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
  'Completed',
  'Project completed and delivered. Client was extremely satisfied with the conversion results!'
);
