/* eslint-disable */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { Comment } = require('./models/Comment');
const { Like } = require('./models/Like');
const { ReadingGroup } = require('./models/ReadingGroup');
const { GroupMember } = require('./models/GroupMember');
const { GroupProgress } = require('./models/GroupProgress');
const { GroupMessage } = require('./models/GroupMessage');
const { Event } = require('./models/Event');
const { Registration } = require('./models/Registration');
const { DeviceToken } = require('./models/DeviceToken');
const { User } = require('./models/User');
const bcrypt = require('bcryptjs');

// -----------------------------------------------------------------------------
// Additional data sets for prayer times, Quran content and mosques.  These
// provide simple placeholder data to support the mobile client when running
// without an external API.  In a production system you would replace these
// with proper libraries (e.g. adhan for prayer times) or datasets for the
// entire Quran.  The goal here is to enable the front‑end to function and
// render screens during development.

// Simple list of surahs containing metadata.  Only a handful of entries are
// provided for demonstration.  See https://en.wikipedia.org/wiki/List_of_surahs
// for the full list.
const SURAH_LIST = [
  {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al‑Fatiha',
    englishNameTranslation: 'The Opener',
    numberOfAyahs: 7,
    revelationType: 'Meccan',
  },
  {
    number: 2,
    name: 'البقرة',
    englishName: 'Al‑Baqarah',
    englishNameTranslation: 'The Cow',
    numberOfAyahs: 286,
    revelationType: 'Medinan',
  },
  {
    number: 3,
    name: 'آل عمران',
    englishName: "Ali 'Imran",
    englishNameTranslation: 'Family of Imran',
    numberOfAyahs: 200,
    revelationType: 'Medinan',
  },
  {
    number: 4,
    name: 'النساء',
    englishName: 'An‑Nisa',
    englishNameTranslation: 'The Women',
    numberOfAyahs: 176,
    revelationType: 'Medinan',
  },
  {
    number: 5,
    name: 'المائدة',
    englishName: "Al‑Ma'idah",
    englishNameTranslation: 'The Table Spread',
    numberOfAyahs: 120,
    revelationType: 'Medinan',
  },
];

// Mapping of surah number to an array of ayah objects.  Only Al‑Fatiha is
// populated with translations for demonstration; other surahs return an empty
// array.  Each ayah object includes the verse number (within the surah), the
// Arabic text, an English translation and an optional tafsir field.
const SURAH_AYAHS = {
  1: [
    {
      number: 1,
      text: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
      translation: 'In the name of Allah, the Most Compassionate, Most Merciful.',
      tafsir:
        'This opening verse expresses the foundational invocation of Muslims seeking blessings and mercy before embarking on any endeavour.',
    },
    {
      number: 2,
      text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      translation: 'All praise is for Allah—Lord of all worlds.',
      tafsir:
        'Muslims acknowledge that all praise ultimately belongs to God, the sustainer and nurturer of every realm and creation.',
    },
    {
      number: 3,
      text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: 'The Most Compassionate, Most Merciful.',
      tafsir:
        'The merciful nature of God is emphasised again, reminding believers of His boundless grace and forgiveness.',
    },
    {
      number: 4,
      text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      translation: 'Master of the Day of Judgment.',
      tafsir:
        'God alone will judge mankind on the Last Day, underscoring accountability and justice in the hereafter.',
    },
    {
      number: 5,
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'You alone we worship and You alone we ask for help.',
      tafsir:
        'A declaration of exclusive devotion and reliance on God, denoting monotheism and surrender to divine will.',
    },
    {
      number: 6,
      text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      translation: 'Guide us along the Straight Path,',
      tafsir:
        'A plea for guidance to the path that leads to God’s pleasure and salvation, free from deviation.',
    },
    {
      number: 7,
      text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      translation:
        'the path of those You have blessed—not those who have earned Your wrath or those who go astray.',
      tafsir:
        'Clarifies the “Straight Path” as the way of the righteous, distinguishing it from the paths of those who anger God or are misguided.',
    },
  ],
};

// A few hard‑coded mosque entries to support the “Find Mosque” page.  Each
// includes coordinates, approximate distance (for demonstration purposes) and an
// open/closed flag.  In a production app these would come from a geocoding
// service or a database query filtered by the user’s location.
const MOSQUES = [
  {
    id: 'm1',
    name: 'Baitul Mustaqin Mosque',
    latitude: 37.7646,
    longitude: -122.4269,
    distance: '736 m',
    status: 'open',
    imageUrl: 'https://example.com/baitul.jpg',
  },
  {
    id: 'm2',
    name: 'Darius Mosque',
    latitude: 37.7707,
    longitude: -122.4115,
    distance: '1.2 km',
    status: 'open',
    imageUrl: 'https://example.com/darius.jpg',
  },
  {
    id: 'm3',
    name: 'Masjid Al‑Hidayah',
    latitude: 37.7718,
    longitude: -122.4324,
    distance: '2.5 km',
    status: 'closed',
    imageUrl: 'https://example.com/hidayah.jpg',
  },
];

// -----------------------------------------------------------------------------
// Sample data for articles and videos.  These arrays power the Articles and
// Videos pages in the mobile app when running the development server.  In a
// production environment these would come from a database or CMS.  Each
// article contains a short description along with a longer body field.  Each
// video contains metadata including the number of views, upload date and a
// placeholder URL.

const ARTICLES = [
  {
    id: 'a1',
    category: 'Historical',
    title: 'The World’s Muslims: Religion, Politics and Society',
    author: 'Natalia Parsha',
    imageUrl: 'https://example.com/article1.jpg',
    description:
      'Muslims around the globe share common beliefs yet display a remarkable diversity in practice, politics and culture. This article examines regional differences and the forces shaping modern Muslim societies.',
    body:
      'Islam is the world’s second-largest religion with over 1.8 billion adherents. Despite common core beliefs, Muslim communities vary greatly by region. In some areas, Sharia law influences national legislation whereas in others, secularism prevails. Political participation ranges from activism to apathy. Economic conditions, colonial history and cultural traditions all play roles. As a result, understanding the world’s Muslims requires appreciating local contexts alongside shared faith.',
  },
  {
    id: 'a2',
    category: 'Historical',
    title: 'Biography of Abdullah bin Umar radhiyallahu ’anhuma',
    author: 'Muhammad Faqih',
    imageUrl: 'https://example.com/article2.jpg',
    description:
      'A concise biography of Abdullah bin Umar, the son of the Caliph Umar ibn al‑Khattab, known for his piety, scholarship and strict adherence to the Sunnah.',
    body:
      'Abdullah bin Umar (r.a.) was among the most knowledgeable companions of the Prophet Muhammad (s.a.w.). He reported numerous hadiths and was revered for his devotion to the Sunnah. Living through the caliphates of Uthman and Ali, he avoided political strife, focusing instead on worship and teaching. His life exemplifies humility, patience and a deep commitment to justice.',
  },
  {
    id: 'a3',
    category: 'Fiqh',
    title: 'Fasting, but Remaining Disobedient',
    author: 'Muhammad Idris',
    imageUrl: 'https://example.com/article3.jpg',
    description:
      'Exploring the paradox of fasting during Ramadan while neglecting other obligatory duties and continuing in sin.',
    body:
      'Fasting in Ramadan is a pillar of Islam, yet its transformative benefits are lost if one persists in disobedience. This article discusses the spiritual purpose of fasting, emphasising sincerity, self‑control and social responsibility. It warns against reducing the fast to mere hunger and thirst while ignoring prayer, charity and good character.',
  },
];

const VIDEOS = [
  {
    id: 'v1',
    category: 'Quran',
    title: 'Summary of During Ramadan Fasting Fiqh',
    author: 'Sarina Ahmad',
    thumbnailUrl: 'https://example.com/video1.jpg',
    duration: '15:21',
    views: 4400,
    uploadDate: '2025-07-24',
    description:
      'An overview of the key rulings and etiquettes of fasting in Ramadan, distilled into a short lecture for quick reference.',
    videoUrl: 'https://example.com/video1.mp4',
  },
  {
    id: 'v2',
    category: 'Hadith',
    title: 'Q&A with Shaykh Abbad',
    author: 'Muhammad Abbad',
    thumbnailUrl: 'https://example.com/video2.jpg',
    duration: '15:21',
    views: 3200,
    uploadDate: '2025-07-20',
    description:
      'Shaykh Abbad answers audience questions on Islamic jurisprudence, covering contemporary issues in everyday life.',
    videoUrl: 'https://example.com/video2.mp4',
  },
  {
    id: 'v3',
    category: 'History',
    title: 'The Beauty of Islamic Art and Architecture',
    author: 'Sarina Ahmad',
    thumbnailUrl: 'https://example.com/video3.jpg',
    duration: '15:21',
    views: 5100,
    uploadDate: '2025-07-12',
    description:
      'A visually rich exploration of mosques, palaces and masterpieces that define the splendour of Islamic art across centuries.',
    videoUrl: 'https://example.com/video3.mp4',
  },
];

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydeen';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Authentication

/**
 * Register a new user with name, email and password.  An app-specific JWT is returned on
 * success along with the saved user document (without passwordHash).  If the email
 * already exists, a 400 is returned.
 */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  // Omit passwordHash from returned user
  const { passwordHash: _, ...safeUser } = user.toObject();
  res.json({ token, user: safeUser });
});

/**
 * Login a user with email and password.  Returns JWT and user if credentials are valid.
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await user.verifyPassword(password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user.toObject();
  res.json({ token, user: safeUser });
});

/**
 * Google login.  Accepts an idToken issued by Google Sign-In.  The token is decoded
 * without remote verification for simplicity; in production you should verify it
 * properly.  If a user with the decoded email does not exist, one is created.
 * Returns app JWT and user document on success.
 */
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ message: 'idToken required' });
  let decoded;
  try {
    decoded = jwt.decode(idToken);
  } catch (e) {
    return res.status(400).json({ message: 'Invalid idToken' });
  }
  if (!decoded || !decoded.email) return res.status(400).json({ message: 'Invalid idToken' });
  const email = decoded.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    const name = decoded.name || email.split('@')[0];
    // Use a random password hash placeholder since password is not used for Google users
    const passwordHash = await bcrypt.hash(idToken, 10);
    user = await User.create({ name, email, passwordHash });
  }
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user.toObject();
  res.json({ token, user: safeUser });
});

// Devices
app.post('/api/devices/register', authRequired, async (req, res) => {
  const { token, platform } = req.body || {};
  if (!token) return res.status(400).json({ message: 'token required' });
  const doc = await DeviceToken.findOneAndUpdate(
    { userId: req.user.sub, token },
    { userId: req.user.sub, token, platform: platform || 'unknown', updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json({ success: true, device: doc });
});

// Comments
app.get('/api/comments', authRequired, async (req, res) => {
  const { parentType, parentId, page = 1, limit = 20 } = req.query;
  if (!parentType || !parentId) return res.status(400).json({ message: 'parentType and parentId required' });
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Comment.find({ parentType, parentId, status: 'approved' }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Comment.countDocuments({ parentType, parentId, status: 'approved' }),
  ]);
  res.json({ data, page: Number(page), limit: Number(limit), total });
});

app.post('/api/comments', authRequired, async (req, res) => {
  const { parentType, parentId, text } = req.body || {};
  if (!parentType || !parentId || !text) return res.status(400).json({ message: 'Missing fields' });
  const comment = await Comment.create({ parentType, parentId, text, userId: req.user.sub, likesCount: 0, status: 'approved' });
  res.json(comment);
});

app.put('/api/comments/:id', authRequired, async (req, res) => {
  const { text } = req.body || {};
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  if (String(c.userId) !== String(req.user.sub) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  c.text = text ?? c.text;
  c.updatedAt = new Date();
  await c.save();
  res.json(c);
});

app.delete('/api/comments/:id', authRequired, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  if (String(c.userId) !== String(req.user.sub) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await c.deleteOne();
  res.json({ success: true });
});

app.post('/api/comments/:id/like', authRequired, async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Not found' });
  const existing = await Like.findOne({ parentType: 'comment', parentId: id, userId: req.user.sub });
  if (existing) return res.json({ liked: true, likesCount: comment.likesCount });
  await Like.create({ parentType: 'comment', parentId: id, userId: req.user.sub });
  comment.likesCount += 1;
  await comment.save();
  res.json({ liked: true, likesCount: comment.likesCount });
});

app.post('/api/comments/:id/unlike', authRequired, async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Not found' });
  const existing = await Like.findOne({ parentType: 'comment', parentId: id, userId: req.user.sub });
  if (!existing) return res.json({ liked: false, likesCount: comment.likesCount });
  await existing.deleteOne();
  comment.likesCount = Math.max(0, comment.likesCount - 1);
  await comment.save();
  res.json({ liked: false, likesCount: comment.likesCount });
});

// Generic Likes (for articles and qa answers)
app.post('/api/likes/toggle', authRequired, async (req, res) => {
  const { parentType, parentId } = req.body || {};
  if (!parentType || !parentId) return res.status(400).json({ message: 'Missing fields' });
  const existing = await Like.findOne({ parentType, parentId, userId: req.user.sub });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Like.create({ parentType, parentId, userId: req.user.sub });
  }
  const count = await Like.countDocuments({ parentType, parentId });
  res.json({ liked: !existing, likesCount: count });
});

// Reading Groups
app.post('/api/reading-groups', authRequired, async (req, res) => {
  const { name, description, target, schedule } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name required' });
  const group = await ReadingGroup.create({ name, description, createdBy: req.user.sub, target: target || { type: 'quran', scope: 'full' }, schedule: schedule || {}, createdAt: new Date() });
  await GroupMember.create({ groupId: group._id, userId: req.user.sub, role: 'owner' });
  res.json(group);
});

app.get('/api/reading-groups', authRequired, async (req, res) => {
  const groups = await ReadingGroup.find().sort({ createdAt: -1 }).limit(100);
  res.json(groups);
});

app.get('/api/reading-groups/:id', authRequired, async (req, res) => {
  const group = await ReadingGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Not found' });
  const members = await GroupMember.find({ groupId: group._id });
  res.json({ group, members });
});

app.post('/api/reading-groups/:id/join', authRequired, async (req, res) => {
  const group = await ReadingGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Not found' });
  const existing = await GroupMember.findOne({ groupId: group._id, userId: req.user.sub });
  if (existing) return res.json({ joined: true });
  await GroupMember.create({ groupId: group._id, userId: req.user.sub, role: 'member' });
  res.json({ joined: true });
});

app.post('/api/reading-groups/:id/leave', authRequired, async (req, res) => {
  await GroupMember.deleteOne({ groupId: req.params.id, userId: req.user.sub });
  res.json({ left: true });
});

app.post('/api/reading-groups/:id/assign', authRequired, async (req, res) => {
  const { assignments } = req.body || {};
  if (!Array.isArray(assignments)) return res.status(400).json({ message: 'assignments array required' });
  const group = await ReadingGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Not found' });
  // Only owner/admin can assign
  const member = await GroupMember.findOne({ groupId: group._id, userId: req.user.sub });
  if (!member || (member.role !== 'owner' && req.user.role !== 'admin')) return res.status(403).json({ message: 'Forbidden' });
  // Upsert progress assignments
  const ops = assignments.map((a) => ({
    updateOne: {
      filter: { groupId: group._id, userId: a.userId, surah: a.surah, fromAyah: a.fromAyah, toAyah: a.toAyah },
      update: { $set: { groupId: group._id, userId: a.userId, surah: a.surah, fromAyah: a.fromAyah, toAyah: a.toAyah, completed: !!a.completed, updatedAt: new Date() } },
      upsert: true,
    },
  }));
  if (ops.length) await GroupProgress.bulkWrite(ops);
  res.json({ success: true });
});

app.post('/api/reading-groups/:id/progress', authRequired, async (req, res) => {
  const { surah, fromAyah, toAyah, completed } = req.body || {};
  if (!surah || !fromAyah || !toAyah) return res.status(400).json({ message: 'Missing fields' });
  const doc = await GroupProgress.findOneAndUpdate(
    { groupId: req.params.id, userId: req.user.sub, surah, fromAyah, toAyah },
    { groupId: req.params.id, userId: req.user.sub, surah, fromAyah, toAyah, completed: !!completed, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json(doc);
});

app.get('/api/reading-groups/:id/progress', authRequired, async (req, res) => {
  const items = await GroupProgress.find({ groupId: req.params.id });
  res.json(items);
});

// Group Chat (basic REST)
app.get('/api/reading-groups/:id/messages', authRequired, async (req, res) => {
  const items = await GroupMessage.find({ groupId: req.params.id }).sort({ createdAt: -1 }).limit(100);
  res.json(items);
});

app.post('/api/reading-groups/:id/messages', authRequired, async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ message: 'text required' });
  const msg = await GroupMessage.create({ groupId: req.params.id, userId: req.user.sub, text, createdAt: new Date() });
  res.json(msg);
});

// Events & registrations
app.post('/api/events', authRequired, adminRequired, async (req, res) => {
  const { title, startsAt, endsAt, location, description } = req.body || {};
  if (!title || !startsAt) return res.status(400).json({ message: 'title and startsAt required' });
  const event = await Event.create({ title, startsAt: new Date(startsAt), endsAt: endsAt ? new Date(endsAt) : undefined, location, description, createdBy: req.user.sub, createdAt: new Date() });
  res.json(event);
});

app.get('/api/events', authRequired, async (req, res) => {
  const now = new Date();
  const upcoming = await Event.find({ $or: [ { endsAt: { $exists: false } }, { endsAt: { $gte: now } } ], startsAt: { $gte: new Date(Date.now() - 7*24*3600*1000) } }).sort({ startsAt: 1 }).limit(100);
  res.json(upcoming);
});

app.get('/api/events/:id', authRequired, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Not found' });
  const count = await Registration.countDocuments({ eventId: event._id });
  const userRegistration = await Registration.findOne({ eventId: event._id, userId: req.user.sub });
  res.json({ ...event.toObject(), registrationsCount: count, registered: !!userRegistration });
});

app.post('/api/events/:id/register', authRequired, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Not found' });
  await Registration.updateOne({ eventId: event._id, userId: req.user.sub }, { $set: { eventId: event._id, userId: req.user.sub, status: 'registered', createdAt: new Date() } }, { upsert: true });
  const count = await Registration.countDocuments({ eventId: event._id });
  res.json({ registered: true, registrationsCount: count });
});

app.delete('/api/events/:id/register', authRequired, async (req, res) => {
  await Registration.deleteOne({ eventId: req.params.id, userId: req.user.sub });
  const count = await Registration.countDocuments({ eventId: req.params.id });
  res.json({ registered: false, registrationsCount: count });
});

app.get('/api/events/:id/registrations', authRequired, adminRequired, async (req, res) => {
  const regs = await Registration.find({ eventId: req.params.id });
  res.json(regs);
});

// Admin moderation
app.get('/api/admin/dashboard', authRequired, adminRequired, async (req, res) => {
  const [pendingComments, groups, events] = await Promise.all([
    Comment.countDocuments({ status: 'pending' }),
    ReadingGroup.countDocuments({}),
    Event.countDocuments({}),
  ]);
  res.json({ pendingComments, groups, events });
});

app.post('/api/admin/comments/:id/approve', authRequired, adminRequired, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.status = 'approved';
  c.updatedAt = new Date();
  await c.save();
  res.json(c);
});

app.delete('/api/admin/comments/:id', authRequired, adminRequired, async (req, res) => {
  await Comment.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

// -----------------------------------------------------------------------------
// Quran endpoints
//
// Return the list of surahs.  This uses the hard‑coded SURAH_LIST defined
// above.  Clients can display the surah names and meta information.  The
// response is cached on the client side via the quranService.
app.get('/api/quran/surahs', async (req, res) => {
  res.json(SURAH_LIST);
});

// Return the ayahs for a particular surah number.  Only Al‑Fatiha (surah 1)
// contains data in our placeholder set; other surahs return an empty array.  A
// real implementation would query a database or read from a dataset.
app.get('/api/quran/surah/:number', async (req, res) => {
  const num = Number(req.params.number);
  const ayahs = SURAH_AYAHS[num] || [];
  res.json(ayahs);
});

// -----------------------------------------------------------------------------
// Prayer times endpoints
//
// In a real application prayer times are calculated using astronomical
// algorithms that depend on the user’s location and the chosen calculation
// method.  Here we return static times to allow the app to render the
// interface.  The month endpoint returns an array of daily times for the
// specified month/year.
app.get('/api/prayer/times', async (req, res) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const times = {
    date: dateStr,
    fajr: '05:00 AM',
    dhuhr: '12:00 PM',
    asr: '03:00 PM',
    maghrib: '06:00 PM',
    isha: '07:30 PM',
  };
  res.json(times);
});

app.get('/api/prayer/month', async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const list = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dateStr = d.toISOString().split('T')[0];
    list.push({
      date: dateStr,
      fajr: '05:00 AM',
      dhuhr: '12:00 PM',
      asr: '03:00 PM',
      maghrib: '06:00 PM',
      isha: '07:30 PM',
    });
  }
  res.json(list);
});

// -----------------------------------------------------------------------------
// Mosques endpoint
//
// Returns a list of nearby mosques with basic meta information.  The client
// could use this to populate a map and list view.  Distances are illustrative
// only; a real implementation would compute them based on the user’s GPS
// coordinates.
app.get('/api/mosques', async (req, res) => {
  res.json(MOSQUES);
});

// -----------------------------------------------------------------------------
// Articles and videos endpoints
//
// Return a list of all articles or videos.  These routes provide simple
// placeholder data that can be consumed by the mobile client.  Individual
// articles or videos can be fetched by id.  In a real application you
// would protect some of these resources behind authentication and use
// pagination or filtering as needed.

// List all articles
app.get('/api/articles', async (req, res) => {
  res.json(ARTICLES);
});

// Get a single article by id
app.get('/api/articles/:id', async (req, res) => {
  const article = ARTICLES.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ message: 'Article not found' });
  res.json(article);
});

// List all videos
app.get('/api/videos', async (req, res) => {
  res.json(VIDEOS);
});

// Get a single video by id
app.get('/api/videos/:id', async (req, res) => {
  const video = VIDEOS.find((v) => v.id === req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  res.json(video);
});

// -----------------------------------------------------------------------------
// User profile endpoints
//
// Return the authenticated user's profile.  Requires a valid JWT.  The
// passwordHash is omitted from the response.
app.get('/api/users/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { passwordHash: _pwd, ...safeUser } = user.toObject();
  res.json(safeUser);
});

// Update the authenticated user's profile.  Allows updating name, gender,
// language and location.  Fields not provided are left unchanged.  Returns the
// updated user document without the password hash.
app.put('/api/users/me', authRequired, async (req, res) => {
  const { name, gender, language, location } = req.body || {};
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (name) user.name = name;
  if (gender) user.gender = gender;
  if (language) user.language = language;
  if (location !== undefined) user.location = location;
  await user.save();
  const { passwordHash: _pwd2, ...safeUser } = user.toObject();
  res.json(safeUser);
});

async function start() {
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'mydeen' });
  return app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

module.exports = { app, start };

if (require.main === module) {
  start().catch((e) => {
    console.error('Failed to start server', e);
    process.exit(1);
  });
}